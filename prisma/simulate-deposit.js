const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    // 1. Get the admin user (or change email to target specific user)
    const email = 'admin@example.com'
    const user = await prisma.user.findUnique({
        where: { email },
        include: { wallet: true }
    })

    if (!user) {
        console.error(`User ${email} not found!`)
        return
    }

    console.log(`Found user: ${user.email}`)
    console.log(`Current Balance: $${user.balance}`)

    // 2. Add fake transaction
    const fakeTxHash = `0xMockTransaction_${Date.now()}`
    const amount = 100.0 // 100 USDT

    await prisma.$transaction([
        prisma.transaction.create({
            data: {
                userId: user.id,
                txHash: fakeTxHash,
                amount: amount,
                asset: 'USDT',
                status: 'completed'
            }
        }),
        prisma.user.update({
            where: { id: user.id },
            data: { balance: { increment: amount } }
        })
    ])

    console.log(`\nSUCCESS: Added $${amount} to account.`)
    console.log(`Fake TxHash: ${fakeTxHash}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
