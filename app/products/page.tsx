import { prisma } from "@/lib/prisma"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScheduleList } from "@/components/ScheduleList"
import { VenueHeader } from "@/components/VenueHeader"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

// Force dynamic rendering validation
export const dynamic = 'force-dynamic'

async function getProducts(searchParams: { city?: string, venue?: string, title?: string, type?: string }) {
    const where: any = {}

    // Loose matching for city/venue to accommodate different inputs
    if (searchParams.city) {
        where.city = searchParams.city
    }

    if (searchParams.venue) {
        const venueQuery = searchParams.venue.toLowerCase();

        // Specific Theater/Venue Logic (Fuzzy Match & Normalization)
        // We still keep the fuzzy logic for SEARCHING, but we don't rely on it for DISPLAYING header info
        if (venueQuery.includes('bolshoi')) {
            where.location = { contains: 'Bolshoi', mode: 'insensitive' }
        } else if (venueQuery.includes('mariinsky')) {
            where.location = { contains: 'Mariinsky', mode: 'insensitive' }
        } else if (venueQuery.includes('kremlin') || venueQuery.includes('armory') || venueQuery.includes('armoury')) {
            where.OR = [
                { location: { contains: 'Kremlin', mode: 'insensitive' } },
                { venue: { contains: 'Armour', mode: 'insensitive' } }, // Matches Armoury
                { venue: { contains: 'Armory', mode: 'insensitive' } }
            ]
        } else {
            // Generic Fuzzy Search
            where.OR = [
                { venue: { contains: searchParams.venue, mode: 'insensitive' } },
                { location: { contains: searchParams.venue, mode: 'insensitive' } },
                // Only search title if it's NOT the same as the venue param (avoid self-filter)
                ...(searchParams.title && searchParams.title !== searchParams.venue
                    ? [{ title: { contains: searchParams.venue, mode: 'insensitive' } }]
                    : [])
            ]
        }
    }

    // If title is explicitly passed and we haven't strictly narrowed by location/venue type above
    // And ensure title is not just repeating the venue name
    if (searchParams.title && !where.location && !where.OR && searchParams.title !== searchParams.venue) {
        where.title = { contains: searchParams.title, mode: 'insensitive' }
    }

    return await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    })
}

export default async function ProductsPage({ searchParams }: { searchParams: { city?: string, venue?: string, title?: string } }) {
    const products = await getProducts(searchParams)

    // Determine Header Info from the FIRST matching product
    // This allows the DB to drive the interface. 
    // If searching for "Bolshoi", we likely get Bolshoi tickets. We use the first one to populate the header description/links.

    const representativeProduct = products[0] as any | undefined

    // Fallback title logic
    let displayTitle = searchParams.title || searchParams.venue || "Products"
    // Ideally we use a clean title from the product if available and if it matches the query
    // But sometimes the product title is specific "Swan Lake", while the search was "Bolshoi".
    // So we prefer the "Location" field if we searched for a Venue.

    if (representativeProduct) {
        if (searchParams.venue && representativeProduct.location) {
            displayTitle = representativeProduct.location
        } else if (searchParams.title && representativeProduct.title) {
            displayTitle = representativeProduct.title
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-white relative">
            {/* Background Gradients (Matched to Home) */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex justify-between items-center mb-6">
                    <Link href="/">
                        <Button variant="ghost" className="text-white hover:bg-white/10 gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to Directory
                        </Button>
                    </Link>
                    <LanguageSwitcher />
                </div>

                <VenueHeader
                    title={displayTitle}
                    googleMap={representativeProduct?.googleMapLink || undefined}
                    yandexMap={representativeProduct?.yandexMapLink || undefined}
                    description={representativeProduct?.description}
                    descriptionZh={representativeProduct?.descriptionZh}
                    descriptionRu={representativeProduct?.descriptionRu}
                    titleZh={representativeProduct?.cityZh ? representativeProduct.location : representativeProduct?.titleZh} // Logic: Product titleZh is strict. Location doesn't have localized field in DB yet? 
                    // Actually, Product has titleZh, but location (e.g. Bolshoi) doesn't have locationZh in schema.
                    // So we might miss the Chinese name for "Bolshoi Theatre" unless we abused titleZh or added a field.
                    // For now, we accept that 'titleZh' might be the product name, not the venue name.
                    // However, if we removed `venues.ts`, we lost the mapping "Bolshoi" -> "莫斯科大剧院".
                    // The user explicitly asked to use DB. So we must use what is in DB.
                    // If DB lacks `locationZh`, we just refrain from showing a chinese title for the VENUE, or show the English one.
                    titleRu={representativeProduct?.titleRu}
                />

                <ScheduleList products={products} />

                {products.length === 0 && (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-xl">
                        <p className="text-xl text-muted-foreground">No performances found.</p>
                        <p className="text-sm text-muted-foreground/60 mt-2">Please check back later.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
