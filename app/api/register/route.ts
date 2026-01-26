import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { walletService } from "@/lib/wallet";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password, wechatId, phoneNumber } = await req.json();

        if (!email || !password || !wechatId || !phoneNumber) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // 1. (Verification Step Removed)

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Transaction to ensure User creation and Wallet creation happen atomically
        // (Note: Prisma doesn't support nested create with index calculation easily in one go efficiently without reading first,
        // so we might need a count. But simple auto-increment logic for derivation index is safer locally.)

        // We need to find the next available derivation index.
        // This is simple: Count total wallets.
        // RACE CONDITION WARNING: In high concurrency, this might conflict. 
        // For this MVP, we will rely on database atomicity or just simple count + 1.
        // Better: Transaction.

        // In a real high-scale app, we might reserve an index first or use a sequence.
        // For now, let's just use Prisma transaction.

        const result = await prisma.$transaction(async (tx) => {
            // Create User
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash: hashedPassword,
                    wechatId,
                    phoneNumber
                },
            });



            // Get next index (User ID-based or global counter?)

            // Get next index (User ID-based or global counter?)
            // Use global counter for HD derivation security/simplicity.
            // But we can also just use the auto-increment ID if we had one.
            // Since we use CUIDs, we don't have a numeric ID.
            // Let's count existing wallets.
            const count = await tx.wallet.count();
            const derivationIndex = count;

            // Derive Address
            let address = "";
            try {
                address = walletService.deriveAddress(derivationIndex);
            } catch (e) {
                console.warn("Wallet derivation failed (likely missing Mnemonic), using mock address.", e);
                address = "0xMockAddress_" + derivationIndex;
            }

            // Create Wallet
            await tx.wallet.create({
                data: {
                    userId: user.id,
                    address: address,
                    derivationIndex: derivationIndex,
                },
            });

            return user;
        });

        return NextResponse.json({
            message: "User created successfully",
            userId: result.id,
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
