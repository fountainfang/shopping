import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ethers } from "ethers";
import { encrypt } from "@/lib/crypto";

export async function POST(req: Request) {
    try {
        const { email, password, wechatId, telegramId, phoneNumber } = await req.json();

        if (!email || !password || !phoneNumber) {
            return NextResponse.json(
                { error: "Email, password, and phone number are required" },
                { status: 400 }
            );
        }

        if (!wechatId && !telegramId) {
            return NextResponse.json(
                { error: "Please provide at least one: WeChat ID or Telegram ID" },
                { status: 400 }
            );
        }

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

        // 1. Generate Random Wallet
        const wallet = ethers.Wallet.createRandom();
        const mnemonic = wallet.mnemonic?.phrase;
        const address = wallet.address;

        if (!mnemonic) {
            throw new Error("Failed to generate wallet mnemonic");
        }

        // 2. Encrypt Mnemonic
        const { encryptedData, iv } = encrypt(mnemonic);

        const result = await prisma.$transaction(async (tx) => {
            // Create User
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash: hashedPassword,
                    wechatId: wechatId || null,
                    telegramId: telegramId || null,
                    phoneNumber
                },
            });

            // Create Wallet with Encrypted Mnemonic
            await tx.wallet.create({
                data: {
                    userId: user.id,
                    address: address,
                    encryptedMnemonic: encryptedData,
                    iv: iv
                },
            });

            return user;
        });

        return NextResponse.json({
            message: "User created successfully",
            userId: result.id,
            walletAddress: address
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
