import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import ClientHome from "@/components/ClientHome"
import { getGroupedVenues } from "@/lib/products"

export default async function ShopPage() {
    const session = await getServerSession(authOptions)

    // Use shared logic to group products
    const serializedGroups = await getGroupedVenues()

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Shop & Tickets</h1>
            <ClientHome session={session} dynamicGroups={serializedGroups} variant="dashboard" />
        </div>
    )
}
