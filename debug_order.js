
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const orderId = 'cmli7vdyv000511jq0v8efhmt';
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { product: true, user: true }
    });
    console.log(JSON.stringify(order, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
