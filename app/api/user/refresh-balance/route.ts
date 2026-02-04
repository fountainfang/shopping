import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { walletService } from "@/lib/wallet";

export const dynamic = 'force-dynamic';

export async function POST() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { wallet: true, transactions: true },
        });

        if (!user || !user.wallet) {
            return NextResponse.json({ error: "User or wallet not found" }, { status: 404 });
        }

        // Get list of already processed tx hashes
        const existingHashes = new Set(user.transactions.map((t) => t.txHash));

        // Scan for new deposits (Scanning last ~1000 blocks for speed, roughly 50 mins on BSC)
        // Production note: Should track 'lastScannedBlock' in DB to avoid missing older txs if user returns after long time.
        // For MVP, we presume user checks relatively often or we scan deeper.
        const newDeposits = await walletService.scanDeposits(user.wallet.address, existingHashes, -2000);

        if (newDeposits.length === 0) {
            return NextResponse.json({ message: "No new deposits found", balance: user.balance });
        }

        // Process new deposits
        let totalAdded = 0;

        await prisma.$transaction(async (tx) => {
            for (const deposit of newDeposits) {
                // Double check existence in TX to be safe against race conditions
                const exists = await tx.transaction.findUnique({ where: { txHash: deposit.txHash } });
                if (exists) continue;

                await tx.transaction.create({
                    data: {
                        userId: user.id,
                        txHash: deposit.txHash,
                        amount: deposit.amount,
                        asset: deposit.asset,
                        status: "completed",
                    },
                });

                // Update User Balance (Assuming 1 USDT = 1 USD for simplicity)
                // In real app, might fetch price feed if accepting multiple assets
                totalAdded += deposit.amount;

                await tx.user.update({
                    where: { id: user.id },
                    data: { balance: { increment: deposit.amount } },
                });
            }
        });

        return NextResponse.json({
            message: `Processed ${newDeposits.length} new deposits`,
            added: totalAdded
        });

    } catch (error) {
        console.error("Refresh balance error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
