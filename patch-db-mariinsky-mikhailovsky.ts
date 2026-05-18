import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const mariinskyData = JSON.parse(fs.readFileSync('mariinsky_raw.json', 'utf8'))
  const mikhailovskyData = JSON.parse(fs.readFileSync('mikhailovsky.json', 'utf8'))
  
  const typeMap = new Map<string, string>()
  
  // Extract Mariinsky
  for (const item of mariinskyData) {
    if (item.summary) {
        let type = null
        const desc = (item.description || "").toLowerCase()
        if (desc.includes('ballet') || desc.includes('dance')) type = 'Балет'
        else if (desc.includes('opera') || desc.includes('cantata')) type = 'Опера'
        else if (desc.includes('concert') || desc.includes('symphony') || desc.includes('piano')) type = 'Концерт'
        
        if (type) {
            typeMap.set(item.summary.toLowerCase().trim(), type)
        }
    }
  }

  // Extract Mikhailovsky
  const performances = Array.isArray(mikhailovskyData) ? mikhailovskyData : (mikhailovskyData.performances || [])
  for (const item of performances) {
      if (item.title) {
          let type = null
          const t = (item.type || "").toLowerCase()
          if (t === 'ballet') type = 'Балет'
          else if (t === 'opera') type = 'Опера'
          else if (t === 'concert') type = 'Концерт'
          
          if (type) {
              typeMap.set(item.title.toLowerCase().trim(), type)
          }
      }
  }

  const products = await prisma.product.findMany({
      where: {
          OR: [
              { venue: { contains: 'Mariinsky' } },
              { venue: { contains: 'Mikhailovsky' } },
              { location: { contains: 'Mariinsky' } },
              { location: { contains: 'Mikhailovsky' } }
          ]
      }
  })
  
  let updatedCount = 0

  for (const p of products) {
    let matchedType = null
    const tEn = p.title ? p.title.toLowerCase().trim() : null
    const tRu = p.titleRu ? p.titleRu.toLowerCase().trim() : null
    
    if (tEn && typeMap.has(tEn)) {
        matchedType = typeMap.get(tEn)
    } else if (tRu && typeMap.has(tRu)) {
        matchedType = typeMap.get(tRu)
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
