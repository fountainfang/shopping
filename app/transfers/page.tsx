import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import ClientFlightsPage from "@/components/ClientFlightsPage"

export const dynamic = 'force-dynamic'

export default async function TransfersPage() {
    const session = await getServerSession(authOptions)
    return <ClientFlightsPage session={session} initialTab="transfers" />
}
