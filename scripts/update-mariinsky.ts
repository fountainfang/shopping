
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting update...')
    const targetAttractionId = 'cmkx4nn74000112wyez0cx8nr'
    const location = 'Mariinsky Theater'

    try {
        const result = await prisma.product.updateMany({
            where: {
                location: location,
            },
            data: {
                attractionId: targetAttractionId,
            },
        })
        console.log(`Successfully updated ${result.count} products with location "${location}" to attractionId "${targetAttractionId}".`)
    } catch (error) {
        console.error('Error updating products:', error)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
