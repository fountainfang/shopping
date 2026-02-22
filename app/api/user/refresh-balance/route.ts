import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { ethers } from "ethers";

// Mainnet Contract Addresses (BSC)
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
// Central Wallet Address where funds are swept to
const CENTRAL_WALLET = "0x35462af62726C8540247F82321F10B22B2AAf323";
// Minimum Gas Required (0.001 BNB)
const MIN_GAS_THRESHOLD = 0.0001;

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        // 1. Authentication Check
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // 2. Fetch User Wallet
        const userWallet = await prisma.wallet.findUnique({
            where: { userId },
        });

        if (!userWallet) {
            return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
        }

        // 3. Initialize Provider and Contract
        const rpcUrl = process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/";
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        const usdtAbi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function transfer(address to, uint256 amount) returns (bool)"
        ];
        const usdtContract = new ethers.Contract(USDT_ADDRESS, usdtAbi, provider);

        // 4. Check Gas (BNB)
        const bnbBalanceWei = await provider.getBalance(userWallet.address);
        const bnbBalance = parseFloat(ethers.formatEther(bnbBalanceWei));

        if (bnbBalance < MIN_GAS_THRESHOLD) {
            return NextResponse.json({
                error: "Insufficient Gas",
                message: `You need at least ${MIN_GAS_THRESHOLD} BNB to process transfers. Current: ${bnbBalance.toFixed(4)} BNB`
            }, { status: 400 });
        }

        // 5. Check USDT Balance
        const usdtBalanceWei = await usdtContract.balanceOf(userWallet.address);
        const decimals = await usdtContract.decimals();
        const usdtBalance = parseFloat(ethers.formatUnits(usdtBalanceWei, decimals));

        if (usdtBalance <= 0) {
            return NextResponse.json({
                error: "No Balance",
                message: "No USDT found to refresh."
            }, { status: 400 });
        }

        // 6. Decrypt Mnemonic and Create Signer
        const mnemonic = decrypt(userWallet.encryptedMnemonic, userWallet.iv);
        if (!mnemonic) {
            return NextResponse.json({ error: "Decryption failed" }, { status: 500 });
        }

        const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);
        const usdtWithSigner = usdtContract.connect(wallet) as ethers.Contract;

        // 7. Execute Transfer
        // We transfer the entire balance found
        const tx = await usdtWithSigner.getFunction("transfer").send(CENTRAL_WALLET, usdtBalanceWei);

        // Wait for 1 confirmation to be safe
        const receipt = await tx.wait(1);

        if (!receipt || receipt.status !== 1) {
            return NextResponse.json({ error: "Transaction Failed", txHash: tx.hash }, { status: 500 });
        }

        // 8. Update Database
        await prisma.$transaction(async (txPrisma) => {
            // Credit User Balance
            await txPrisma.user.update({
                where: { id: userId as string },
                data: {
                    balance: { increment: usdtBalance }
                }
            });

            // Record Transaction
            await txPrisma.transaction.create({
                data: {
                    userId: userId as string,
                    txHash: receipt.hash,
                    amount: usdtBalance,
                    asset: "USDT",
                    status: "completed"
                }
            });
        });

        return NextResponse.json({
            success: true,
            message: "Balance updated successfully!",
            amount: usdtBalance,
            txHash: receipt.hash
        });

    } catch (error: any) {
        console.error("Refresh balance error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}
