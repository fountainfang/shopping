import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { VenueHeader } from "@/components/VenueHeader"
import { ScheduleList } from "@/components/ScheduleList"
import { DateFilter } from "@/components/DateFilter"
import { ProductFilter } from "@/components/ProductFilter"
import { ensureAttractionSlots } from "@/lib/slots"

// Force dynamic
export const dynamic = 'force-dynamic'

export default async function AttractionPage({ params, searchParams }: { params: { id: string }, searchParams: { startDate?: string, endDate?: string, productId?: string } }) {
    // Sync slots on load
    await ensureAttractionSlots(params.id);

    const attraction = await prisma.attraction.findUnique({
        where: { id: params.id },
        include: {
            products: {
                orderBy: { price: 'asc' } // or whatever order
            }
        }
    })

    if (!attraction) {
        notFound()
    }

    // Filter Products: Remove past slots and remove products with no future slots (unless open-dated)
    // using sv-SE locale gives YYYY-MM-DD HH:MM:SS format
    const moscowTime = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Moscow", hour12: false }).replace(' ', ' ').substring(0, 16);

    const filteredProducts = attraction.products.map(p => {
        // If no slots (open ticket), keep as is
        if (!p.availableSlots || !Array.isArray(p.availableSlots) || p.availableSlots.length === 0) {
            return p;
        }

        // Filter slots
        const validSlots = (p.availableSlots as string[]).filter(slot => {
            // Must be in the future
            if (slot < moscowTime) return false;
            
            const slotDate = slot.substring(0, 10);
            
            // If a start date is selected, must be on or after that date
            if (searchParams.startDate && slotDate < searchParams.startDate) return false;
            
            // If an end date is selected, must be on or before that date
            if (searchParams.endDate && slotDate > searchParams.endDate) return false;
            
            return true;
        });

        // Return product with filtered slots
        return {
            ...p,
            availableSlots: validSlots
        };
    }).filter(p => {
        // Keep if open ticket (no slots originally) OR has valid future slots
        // We need to check if it HAD slots originally. 
        // If p.availableSlots is now empty, but originally wasn't (implied by previous logic), it should be removed.

        // However, the map above returns a new object with filtered slots.
        // If the original had slots, and now validSlots is empty, we should drop it.

        // Re-check logic:
        // Case 1: Original had no slots -> map returns p (no change) -> keep.
        // Case 2: Original had slots -> map returns new p with validSlots.
        //    If validSlots is empty -> Drop.
        //    If validSlots has items -> Keep.

        if (!p.availableSlots || !Array.isArray(p.availableSlots)) return true; // Should be covered by map logic but safe check
        return p.availableSlots.length > 0;
    });

    // Filter by selected product if specified in searchParams
    let displayedProducts = filteredProducts;
    if (searchParams.productId) {
        displayedProducts = filteredProducts.filter(p => p.id === searchParams.productId);
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-white relative">
            {/* Background Gradients */}
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
                    title={attraction.name}
                    titleZh={attraction.nameZh || undefined}
                    titleRu={attraction.nameRu || undefined}
                    description={attraction.description || undefined}
                    descriptionZh={attraction.descriptionZh || undefined}
                    descriptionRu={attraction.descriptionRu || undefined}
                    googleMap={attraction.googleMapLink || undefined}
                    yandexMap={attraction.yandexMapLink || undefined}
                />

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white px-2">Available Tickets & Services</h2>
                    <div className="flex flex-wrap gap-4 items-center">
                        <DateFilter />
                        <ProductFilter products={filteredProducts} />
                    </div>
                    <ScheduleList products={displayedProducts} />

                    {displayedProducts.length === 0 && (
                        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-xl text-muted-foreground">No tickets currently available online.</p>
                            <p className="text-sm text-muted-foreground/60 mt-2">Please contact support or check back later.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
