const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@example.com'
    const password = 'password123'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if admin exists
    const existing = await prisma.user.findUnique({
        where: { email }
    })

    if (existing) {
        console.log(`Admin user ${email} already exists. Updating role to admin...`)
        await prisma.user.update({
            where: { email },
            data: { role: 'admin' }
        })
        console.log("Role updated.")
        return
    }

    const user = await prisma.user.create({
        data: {
            email,
            passwordHash: hashedPassword,
            role: 'admin',
            wallet: {
                create: {
                    address: '0xAdminWalletStub', // No real derivation for admin stub needed mostly
                    derivationIndex: -1 // Reserved for admin
                }
            }
        }
    })

    console.log(`Created admin user: ${user.email} with password: ${password}`)
    console.log(`Role: ${user.role}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
