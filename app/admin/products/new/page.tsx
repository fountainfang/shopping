import { prisma } from "@/lib/prisma"
import NewProductClient from "./NewProductClient"

export default async function NewProductPage() {
    // Fetch distinct cities from existing products for autocomplete
    const products = await prisma.product.findMany({
        select: {
            city: true,
            cityZh: true,
            cityRu: true
        },
        where: {
            city: { not: null } // Only where city is defined
        }
    })

    // Fetch Attractions for dropdown
    const attractions = await prisma.attraction.findMany({
        select: { id: true, name: true, city: true },
        orderBy: { name: 'asc' }
    })

    // Deduplicate logic
    const cityMap = new Map<string, { en: string, zh: string, ru: string }>();

    products.forEach(p => {
        if (!p.city) return;
        if (!cityMap.has(p.city)) {
            cityMap.set(p.city, {
                en: p.city,
                zh: p.cityZh || "",
                ru: p.cityRu || ""
            })
        }
    })

    const existingCities = Array.from(cityMap.values()).sort((a, b) => a.en.localeCompare(b.en));

    return <NewProductClient existingCities={existingCities} attractions={attractions} />
}
