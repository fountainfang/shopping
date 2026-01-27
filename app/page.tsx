import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import ClientHome from "@/components/ClientHome"
import { getGroupedAttractions } from "@/lib/products"

// Force dynamic rendering validation
export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getServerSession(authOptions)

  try {
    // Fetch grouped attractions
    const serializedGroups = await getGroupedAttractions()

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
