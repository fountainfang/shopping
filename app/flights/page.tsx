import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import ClientFlightsPage from "@/components/ClientFlightsPage"

export const dynamic = 'force-dynamic'

export default async function FlightsPage({ searchParams }: { searchParams?: { tab?: string } }) {
    const session = await getServerSession(authOptions)
    const initialTab = searchParams?.tab === 'transfers' ? 'transfers' : 'flights'
    return <ClientFlightsPage session={session} initialTab={initialTab} />
}
