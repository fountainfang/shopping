import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const moscowData = JSON.parse(fs.readFileSync('moscow.json', 'utf8'))
  const typeMap = new Map<string, string>()
  
  for (const item of moscowData) {
    if (item.showName && item.performanceTypeName) {
      typeMap.set(item.showName.toLowerCase(), item.performanceTypeName)
    }
    if (item.showForeignName && item.performanceTypeName) {
      typeMap.set(item.showForeignName.toLowerCase(), item.performanceTypeName)
    }
  }

  const products = await prisma.product.findMany()
  let updatedCount = 0

  for (const p of products) {
    let matchedType = null
    if (p.title && typeMap.has(p.title.toLowerCase())) {
        matchedType = typeMap.get(p.title.toLowerCase())
    } else if (p.titleRu && typeMap.has(p.titleRu.toLowerCase())) {
        matchedType = typeMap.get(p.titleRu.toLowerCase())
    }
    
    if (matchedType && (!p.descriptionRu || !p.descriptionRu.includes(matchedType))) {
      const newDesc = p.descriptionRu ? p.descriptionRu + ' ' + matchedType : matchedType
      await prisma.product.update({
        where: { id: p.id },
        data: { descriptionRu: newDesc }
      })
      console.log(`Updated product '${p.title}' with type '${matchedType}'`)
      updatedCount++
    }
  }
  
  console.log(`Successfully updated ${updatedCount} products.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
