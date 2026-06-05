import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { ethers } from "ethers";

// Mainnet Contract Addresses (BSC)
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const USDC_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
// Central Wallet Address where funds are swept to
const CENTRAL_WALLET = "0x35462af62726C8540247F82321F10B22B2AAf323";
// Minimum Gas Required per transfer (0.0001 BNB)
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

        const abi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function transfer(address to, uint256 amount) returns (bool)"
        ];
        const usdtContract = new ethers.Contract(USDT_ADDRESS, abi, provider);
        const usdcContract = new ethers.Contract(USDC_ADDRESS, abi, provider);

        // Check USDT Balance
        const usdtBalanceWei = await usdtContract.balanceOf(userWallet.address);
        const usdtDecimals = await usdtContract.decimals();
        const usdtBalance = parseFloat(ethers.formatUnits(usdtBalanceWei, usdtDecimals));

        // Check USDC Balance
        const usdcBalanceWei = await usdcContract.balanceOf(userWallet.address);
        const usdcDecimals = await usdcContract.decimals();
        const usdcBalance = parseFloat(ethers.formatUnits(usdcBalanceWei, usdcDecimals));

        if (usdtBalance <= 0 && usdcBalance <= 0) {
            return NextResponse.json({
                error: "No Balance",
                message: "No USDT or USDC found to refresh."
            }, { status: 400 });
        }

        // 4. Check Gas (BNB)
        const bnbBalanceWei = await provider.getBalance(userWallet.address);
        const bnbBalance = parseFloat(ethers.formatEther(bnbBalanceWei));

        const requiredSweeps = (usdtBalance > 0 ? 1 : 0) + (usdcBalance > 0 ? 1 : 0);
        const requiredGas = MIN_GAS_THRESHOLD * requiredSweeps;

        if (bnbBalance < requiredGas) {
            return NextResponse.json({
                error: "Insufficient Gas",
                message: `You need at least ${requiredGas} BNB to process transfers. Current: ${bnbBalance.toFixed(4)} BNB`
            }, { status: 400 });
        }

        // 5. Decrypt Mnemonic and Create Signer
        const mnemonic = decrypt(userWallet.encryptedMnemonic, userWallet.iv);
        if (!mnemonic) {
            return NextResponse.json({ error: "Decryption failed" }, { status: 500 });
        }

        const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);

        const processedSweeps: { symbol: string; amount: number; txHash: string }[] = [];
        let totalCreditedAmount = 0;

        // 6. Execute USDT Transfer
        if (usdtBalance > 0) {
            try {
                const usdtWithSigner = usdtContract.connect(wallet) as ethers.Contract;
                const tx = await usdtWithSigner.getFunction("transfer").send(CENTRAL_WALLET, usdtBalanceWei);
                const receipt = await tx.wait(1);
                if (receipt && receipt.status === 1) {
                    // Credit User Balance
                    await prisma.$transaction(async (txPrisma) => {
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
                    processedSweeps.push({ symbol: "USDT", amount: usdtBalance, txHash: receipt.hash });
                    totalCreditedAmount += usdtBalance;
                } else {
                    console.error("USDT transfer transaction failed status in receipt");
                }
            } catch (err: any) {
                console.error("USDT sweep error:", err);
                if (usdcBalance <= 0) {
                    return NextResponse.json({ error: "USDT Transaction Failed", details: err.message }, { status: 500 });
                }
            }
        }

        // 7. Execute USDC Transfer
        if (usdcBalance > 0) {
            try {
                const usdcWithSigner = usdcContract.connect(wallet) as ethers.Contract;
                const tx = await usdcWithSigner.getFunction("transfer").send(CENTRAL_WALLET, usdcBalanceWei);
                const receipt = await tx.wait(1);
                if (receipt && receipt.status === 1) {
                    // Credit User Balance
                    await prisma.$transaction(async (txPrisma) => {
                        await txPrisma.user.update({
                            where: { id: userId as string },
                            data: {
                                balance: { increment: usdcBalance }
                            }
                        });

                        // Record Transaction
                        await txPrisma.transaction.create({
                            data: {
                                userId: userId as string,
                                txHash: receipt.hash,
                                amount: usdcBalance,
                                asset: "USDC",
                                status: "completed"
                            }
                        });
                    });
                    processedSweeps.push({ symbol: "USDC", amount: usdcBalance, txHash: receipt.hash });
                    totalCreditedAmount += usdcBalance;
                } else {
                    console.error("USDC transfer transaction failed status in receipt");
                }
            } catch (err: any) {
                console.error("USDC sweep error:", err);
                if (processedSweeps.length === 0) {
                    return NextResponse.json({ error: "USDC Transaction Failed", details: err.message }, { status: 500 });
                }
            }
        }

        if (processedSweeps.length === 0) {
            return NextResponse.json({
                error: "Transaction Failed",
                message: "Failed to sweep any token balances. Please try again."
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Balance updated successfully! Credited: $${totalCreditedAmount.toFixed(2)}`,
            amount: totalCreditedAmount,
            sweeps: processedSweeps
        });

    } catch (error: any) {
        console.error("Refresh balance error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}
