import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import EditProductClient from "./EditProductClient"

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const product = await prisma.product.findUnique({
        where: { id: params.id }
    });

    if (!product) {
        redirect("/admin/products");
    }

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

    // Fetch Attractions
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

    return <EditProductClient product={product} existingCities={existingCities} attractions={attractions} />
}
