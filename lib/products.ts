import { prisma } from "@/lib/prisma"

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
        // Priority: Location (Main Venue like "Bolshoi Theatre") > Venue (Specific Hall) > Title

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

        // Use the product's own localized titles if available, assuming the product represents the venue well enough
        // or if the admin has entered data consistent with the location name.
        // For general grouping, we just need the NAME. The localized names might be tricky if "location" is just a string.
        // Ideally, 'location' refers to the Venue Name. 
        // We will try to use the *first encountered* translations for this location KEY.

        // Since we don't have a separate Venue table, we rely on the product's localization fields 
        // IF the product title seems to match the location name, OR we just take the first product's locale fields as a "best guess" for the venue name's translation?
        // Actually, `titleZh` is the PRODUCT title, not the VENUE title.
        // But in many cases "Bolshoi Theatre Ticket" might have titleZh "莫斯科大剧院票".
        // The previous code relied on hardcoded dictionary for "Bolshoi Theatre" -> "莫斯科大剧院".
        // WITHOUT that dictionary, we can only use what's in the DB.
        // If the DB `location` is just "Bolshoi Theatre", we don't know the Chinese for it unless we have it stored.
        // Use-case: The user mostly wants to use DB content. 
        // We will fallback to English only if no translation found, OR assume `titleZh` contains useful info? 
        // Best approach: WE JUST USE THE ENGLISH NAME for keying. 
        // AND we expose `nameZh` / `nameRu` IF explicitly added to a Venue Table later. 
        // But for now, we will leave them undefined if we can't be sure, OR use the `product.titleZh` if `product.title == name`.

        if (name === p.title) {
            nameZh = p.titleZh || undefined
            nameRu = p.titleRu || undefined
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
