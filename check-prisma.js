const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking Prisma Client...');
    if (prisma.attraction) {
        console.log('prisma.attraction exists!');
        try {
            const count = await prisma.attraction.count();
            console.log('Attraction count:', count);
        } catch (e) {
            console.error('Error querying attraction:', e.message);
        }
    } else {
        console.error('prisma.attraction is UNDEFINED');
        console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_')));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
