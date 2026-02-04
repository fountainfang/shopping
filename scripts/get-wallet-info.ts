import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const wallets = await prisma.wallet.findMany({
        include: { user: true }
    });

    console.log(`Found ${wallets.length} wallets.\n`);

    const secretKey = process.env.WALLET_SECRET || "0000000000000000000000000000000000000000000000000000000000000000";

    for (const w of wallets) {
        console.log(`User: ${w.user.email} (ID: ${w.user.id})`);
        console.log(`Address: ${w.address}`);
        console.log(`Encrypted Mnemonic: ${w.encryptedMnemonic}`);
        console.log(`IV (iv_hex): ${w.iv}`);
        console.log(`\nDecryption Command:`);
        console.log(`python3 decrypt_mnemonic.py "${w.encryptedMnemonic}" "${w.iv}" "${secretKey}"`);
        console.log("-".repeat(50));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
