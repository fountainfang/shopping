const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    // Optional: Clear existing products to show only the new request
    // await prisma.product.deleteMany({}) 

    const products = [
        {
            title: 'Moscow Kremlin Archive Ticket',
            description: 'General admission to the architectural ensemble of the Cathedral Square. Includes entry to the assumption, Archangel and Annunciation cathedrals.',
            price: 12.50,
            stock: 50,
            content: 'KREMLIN-TICKET-CODE-X8293'
        },
        {
            title: 'Hermitage Museum - Main Complex',
            description: 'Skip-the-line entry to the Main Museum Complex in St. Petersburg. Valid for one day.',
            price: 18.00,
            stock: 100,
            content: 'HERMITAGE-PASS-99283'
        },
        {
            title: 'Bolshoi Theatre - Swan Lake Premium',
            description: 'Historic Stage, Stalls, Row 5. Experience the world-famous ballet in Moscow.',
            price: 150.00,
            stock: 5,
            content: 'BOLSHOI-SEAT-5-12'
        },
        {
            title: 'Peterhof Grand Palace Tour',
            description: 'Full access to the Lower Park and Grand Palace fountains. Verify opening hours before visit.',
            price: 25.00,
            stock: 30,
            content: 'PETERHOF-QR-2211'
        },
    ]

    console.log('Seeding Russian attraction tickets...')

    for (const p of products) {
        await prisma.product.create({
            data: p
        })
    }

    console.log(`Seeded ${products.length} products`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
