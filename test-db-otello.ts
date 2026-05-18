import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const p = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: 'tello' } },
        { title: { contains: 'телло' } },
        { titleRu: { contains: 'телло' } }
      ]
    },
    select: {
      id: true,
      title: true,
      titleRu: true,
      descriptionRu: true,
      createdAt: true,
      attractionId: true
    }
  })
  console.log(JSON.stringify(p, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
