
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const products = await prisma.product.findMany({
        where: {
            title: {
                contains: 'Kremlin',
                mode: 'insensitive'
            }
        },
        select: {
            id: true,
            title: true,
            titleZh: true,
            descriptionZh: true
        }
    })
    console.log(JSON.stringify(products, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
