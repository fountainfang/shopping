import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const id = "cmkuoxtqb000012cs6tc3prxj";
    console.log(`Looking for product ${id}...`);

    const product = await prisma.product.findUnique({
        where: { id }
    });

    if (product) {
        console.log("Found product:", JSON.stringify(product, null, 2));
    } else {
        console.log("Product NOT found in DB.");
    }

    // Also check what 'kremlin' search returns
    console.log("\nChecking 'kremlin' search query match...");
    const matches = await prisma.product.findMany({
        where: {
            OR: [
                { location: { contains: 'Kremlin', mode: 'insensitive' } },
                { venue: { contains: 'Armour', mode: 'insensitive' } },
                { venue: { contains: 'Armory', mode: 'insensitive' } }
            ]
        },
        select: { id: true, title: true, location: true, venue: true }
    });

    console.log(`Search matched ${matches.length} items.`);
    const isMatched = matches.some(p => p.id === id);
    console.log(`Is our target product in the results? ${isMatched}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
