import { prisma } from "@/lib/prisma"
import { VENUES } from "@/lib/data/venues"

export type VenueInfo = { name: string, nameZh?: string, nameRu?: string }
export type SerializedGroups = Record<string, VenueInfo[]>

export async function getGroupedVenues(): Promise<SerializedGroups> {
    // Fetch all products to build the directory dynamically
    const products = await prisma.product.findMany({
        select: {
            id: true,
            city: true,
            cityZh: true,
            cityRu: true,
            venue: true,
            location: true,
            title: true,
            titleZh: true,
            titleRu: true,
            type: true,
        }
    })

    // Group by City
    const cityGroups: Record<string, Map<string, VenueInfo>> = {}

    products.forEach(p => {
        const rawCity = p.city || "Other"
        const cityKey = rawCity

        if (!cityGroups[cityKey]) {
            cityGroups[cityKey] = new Map()
        }

        // Determine Venue/Location Name for Grouping
        // We want to group by the MAIN entity (e.g. Bolshoi Theatre), not the specific hall (Historic Stage).
        // In our generic import: location = "Bolshoi Theatre", venue = "Historic Stage".
        // So we prioritize location.

        let name = "General"
        let nameZh = undefined
        let nameRu = undefined

        if (p.location) {
            name = p.location
        } else if (p.venue) {
            name = p.venue
        } else if (p.title) {
            name = p.title
        }

        // Capture multilingual fields
        // Attempt to lookup in static VENUES data first for well-known places
        if (name) {
            // Normalize for lookup (simple check)
            const lower = name.toLowerCase()
            const matchKey = Object.keys(VENUES).find(k => lower.includes(k) || (VENUES as any)[k].names.en.toLowerCase().includes(lower))

            if (matchKey) {
                const v = VENUES[matchKey]
                nameZh = v.names.zh
                nameRu = v.names.ru
                // Optionally enforce the canonical English name too to merge "Bolshoi" and "Bolshoi Theatre"
                name = v.names.en
            } else if (p.title) {
                // Fallback to product title translations if we are using title as name
                if (name === p.title) {
                    nameZh = p.titleZh || undefined
                    nameRu = p.titleRu || undefined
                }
            }
        }

        // Deduplicate by English name
        if (!cityGroups[cityKey].has(name)) {
            cityGroups[cityKey].set(name, { name, nameZh, nameRu })
        }
    })

    // Convert to arrays
    const serializedGroups: SerializedGroups = {}
    Object.keys(cityGroups).forEach(city => {
        serializedGroups[city] = Array.from(cityGroups[city].values())
    })

    return serializedGroups
}
