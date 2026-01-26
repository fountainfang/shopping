import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import ClientHome from "@/components/ClientHome"
import { prisma } from "@/lib/prisma"
import { VENUES } from "@/lib/data/venues"

// Force dynamic rendering validation
export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getServerSession(authOptions)

  try {
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
    type VenueInfo = { name: string, nameZh?: string, nameRu?: string }
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
    const serializedGroups: Record<string, VenueInfo[]> = {}
    Object.keys(cityGroups).forEach(city => {
      serializedGroups[city] = Array.from(cityGroups[city].values())
    })

    return <ClientHome session={session} dynamicGroups={serializedGroups} />

  } catch (error) {
    console.error("Homepage Error:", error)
    // Fallback UI or empty state
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Temporarily Unavailable</h1>
          <p className="text-slate-400">We are unable to load the directory at this moment.</p>
          <p className="text-xs text-slate-600 mt-4">{String(error)}</p>
        </div>
      </div>
    )
  }
}
