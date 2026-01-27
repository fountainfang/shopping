import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { VenueHeader } from "@/components/VenueHeader"
import { ScheduleList } from "@/components/ScheduleList"

// Force dynamic
export const dynamic = 'force-dynamic'

export default async function AttractionPage({ params }: { params: { id: string } }) {
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
                    <ScheduleList products={attraction.products} />

                    {attraction.products.length === 0 && (
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
