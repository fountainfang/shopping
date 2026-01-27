const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Clearing existing wallets to allow schema migration...')
    try {
        // Need to delete wallets because we are changing the schema inextricably
        // and we don't want to wipe the whole DB.
        // Note: We might need to run this with the OLD client? 
        // Actually, DELETE is fine even if schema is slightly mismatched usually, 
        // but the Client might validate.
        // If client validation fails, we can use raw query.

        // Let's try raw query to be safe against schema mismatch.
        await prisma.$executeRawUnsafe('DELETE FROM "Wallet";')
        console.log('All wallets deleted.')
    } catch (e) {
        console.error(e)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
