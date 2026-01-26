import { prisma } from "@/lib/prisma"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScheduleList } from "@/components/ScheduleList"
import { VENUES } from "@/lib/data/venues"
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

        // Specific Theater Logic
        if (venueQuery === 'bolshoi') {
            where.location = { contains: 'Bolshoi', mode: 'insensitive' }
        } else if (venueQuery === 'mariinsky') {
            where.location = { contains: 'Mariinsky', mode: 'insensitive' }
        } else {
            // Generic Strict Search
            // If user passed venue=Kremlin complex, we search strictly for that.
            where.OR = [
                { venue: { contains: searchParams.venue, mode: 'insensitive' } },
                { location: { contains: searchParams.venue, mode: 'insensitive' } },
                { title: { contains: searchParams.venue, mode: 'insensitive' } },
                // If title param is also passed, it overrides specific title match
                ...(searchParams.title ? [{ title: { contains: searchParams.title, mode: 'insensitive' } }] : [])
            ]
        }
    }

    // If title is explicitly passed and we haven't strictly narrowed by venue ID above
    if (searchParams.title && !where.location) {
        where.title = { contains: searchParams.title, mode: 'insensitive' }
    }

    return await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    })
}

export default async function ProductsPage({ searchParams }: { searchParams: { city?: string, venue?: string, title?: string } }) {
    const products = await getProducts(searchParams)
    const title = searchParams.title || "Products"

    // Find static venue info if available
    const venueId = searchParams.venue?.toLowerCase()
    const venueInfo = venueId ? VENUES[venueId] : undefined

    return (
        <div className="min-h-screen flex flex-col bg-[#0f172a] text-white selection:bg-teal-500 selection:text-white font-sans relative">
            {/* Background Gradients (Matched to Home) */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex justify-between items-center mb-6">
                    <Link href="/">
                        <Button variant="ghost" className="text-white hover:bg-teal-700 hover:text-white gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to Directory
                        </Button>
                    </Link>
                    <LanguageSwitcher />
                </div>

                <VenueHeader
                    title={title}
                    venueInfo={venueInfo}
                    googleMap={(products[0] as any)?.googleMapLink || undefined}
                    yandexMap={(products[0] as any)?.yandexMapLink || undefined}
                    description={(products[0] as any)?.description || undefined}
                    descriptionZh={(products[0] as any)?.descriptionZh || undefined}
                    descriptionRu={(products[0] as any)?.descriptionRu || undefined}
                    titleZh={(products[0] as any)?.titleZh || undefined}
                    titleRu={(products[0] as any)?.titleRu || undefined}
                />

                <ScheduleList products={products} />

                {products.length === 0 && (
                    <div className="text-center py-20 bg-black/20 rounded-xl">
                        <p className="text-xl text-teal-100">No performances found.</p>
                        <p className="text-sm text-teal-300 mt-2">Please check back later.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
