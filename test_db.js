
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const count = await prisma.product.count()
        console.log(`Connection successful! Found ${count} products.`)
    } catch (e) {
        console.error("Connection failed:", e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
