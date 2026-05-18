import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const p = await prisma.product.findFirst({ where: { title: 'Otello' } })
  console.log(p)
}
main().catch(console.error).finally(() => prisma.$disconnect())
