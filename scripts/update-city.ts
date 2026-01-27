import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Updating city names...");
    const result = await prisma.product.updateMany({
        where: {
            city: "St. Petersburg"
        },
        data: {
            city: "Saint Petersburg"
        }
    });

    console.log(`Updated ${result.count} products from 'St. Petersburg' to 'Saint Petersburg'.`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
