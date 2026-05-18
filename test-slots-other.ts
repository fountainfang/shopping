import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const p = await prisma.product.findMany({
    where: { OR: [{ venue: { contains: 'Mariinsky' } }, { venue: { contains: 'Mikhailovsky' } }] },
    select: { title: true, availableSlots: true, venue: true },
    take: 5
  })
  console.log(JSON.stringify(p, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
