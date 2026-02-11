import { prisma } from "@/lib/prisma"

export type VenueInfo = { name: string, nameZh?: string, nameRu?: string }

export type AttractionInfo = {
    id: string;
    name: string;
    nameZh?: string;
    nameRu?: string;
    image?: string;
    description?: string;
}

export type CityGroup = {
    id: string;
    name: string;
    nameZh?: string;
    nameRu?: string;
    venues: VenueInfo[];
    attractions?: AttractionInfo[];
}

export async function getGroupedAttractions(filterDate?: string): Promise<CityGroup[]> {
    // @ts-ignore - Prisma client update might lag in IDE
    const attractions = await prisma.attraction.findMany({
        orderBy: { name: 'asc' },
        include: { products: true }
    })

    // Current Moscow Time String for comparison (YYYY-MM-DD HH:MM)
    // using sv-SE locale gives YYYY-MM-DD HH:MM:SS format
    const moscowTime = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Moscow", hour12: false }).replace(' ', ' ').substring(0, 16);

    const cityMap = new Map<string, CityGroup>()

    // @ts-ignore
    attractions.forEach((attr: any) => {
        // Filter Logic:
        // 1. Must have products
        // 2. If product has NO slots -> Keep (Open dated)
        // 3. If product HAS slots -> Check if any slot > moscowTime
        // 4. If filterDate provided -> must also match the date
        const validProducts = attr.products.filter((p: any) => {
            const hasSlots = p.availableSlots && Array.isArray(p.availableSlots) && p.availableSlots.length > 0;
            if (!hasSlots) return true; // Open dated

            // Basic future check
            const hasFutureSlot = p.availableSlots.some((slot: string) => slot >= moscowTime);
            if (!hasFutureSlot) return false;

            // Specific date filter
            if (filterDate) {
                return p.availableSlots.some((slot: string) => slot.startsWith(filterDate));
            }

            return true;
        });

        if (validProducts.length === 0) return; // Skip this attraction

        const cityKey = attr.city || "Other"

        if (!cityMap.has(cityKey)) {
            cityMap.set(cityKey, {
                id: cityKey,
                name: cityKey,
                nameZh: attr.cityZh || cityKey,
                nameRu: attr.cityRu || cityKey,
                venues: [],
                attractions: []
            })
        }

        const cityGroup = cityMap.get(cityKey)!
        // Improve city localization if current attr has it and group doesn't
        if (cityGroup.name === cityKey && attr.cityZh) cityGroup.nameZh = attr.cityZh;
        if (cityGroup.name === cityKey && attr.cityRu) cityGroup.nameRu = attr.cityRu;

        cityGroup.attractions?.push({
            id: attr.id,
            name: attr.name,
            nameZh: attr.nameZh || undefined,
            nameRu: attr.nameRu || undefined,
            image: attr.image || undefined,
            description: attr.description || undefined
        })
    })

    return Array.from(cityMap.values()).sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA === 'other' || nameA === 'others') return 1;
        if (nameB === 'other' || nameB === 'others') return -1;
        return a.name.localeCompare(b.name);
    })
}

export async function getGroupedVenues(): Promise<CityGroup[]> {
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

    // Intermediate Map to hold City Data + Venues
    const cityMap = new Map<string, {
        name: string,
        nameZh?: string,
        nameRu?: string,
        venues: Map<string, VenueInfo>
    }>()

    products.forEach(p => {
        const rawCity = p.city || "Other"

        if (!cityMap.has(rawCity)) {
            cityMap.set(rawCity, {
                name: rawCity,
                nameZh: p.cityZh || undefined,
                nameRu: p.cityRu || undefined,
                venues: new Map()
            })
        }

        const cityEntry = cityMap.get(rawCity)!

        // If we found a product with better localized city names, update the group
        if (!cityEntry.nameZh && p.cityZh) cityEntry.nameZh = p.cityZh
        if (!cityEntry.nameRu && p.cityRu) cityEntry.nameRu = p.cityRu

        // Determine Venue/Location Name for Grouping
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

        // Capture venue localization from product title if capable
        if (name === p.title) {
            nameZh = p.titleZh || undefined
            nameRu = p.titleRu || undefined
        }

        // Deduplicate venues
        if (!cityEntry.venues.has(name)) {
            cityEntry.venues.set(name, { name, nameZh, nameRu })
        }
    })

    // Convert to array and sort
    const results: CityGroup[] = Array.from(cityMap.entries()).map(([key, value]) => ({
        id: key,
        name: value.name,
        nameZh: value.nameZh,
        nameRu: value.nameRu,
        venues: Array.from(value.venues.values())
    })).sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA === 'other' || nameA === 'others') return 1;
        if (nameB === 'other' || nameB === 'others') return -1;
        return a.name.localeCompare(b.name);
    })

    return results
}
