import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const p = await prisma.product.findMany({
    select: { title: true, availableSlots: true },
    where: { type: 'THEATER' },
    take: 10
  })
  console.log(JSON.stringify(p, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
