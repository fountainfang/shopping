import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Wallet, RefreshCw, Plus, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import DashboardClient from "./DashboardClient"


async function getUserData(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            wallet: true,
            orders: {
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { product: true }
            },
            transactions: {
                take: 10,
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!user) return null

    // Merge and Sort
    const activity = [
        ...user.orders.map(o => ({
            id: o.id,
            type: 'Purchase',
            description: o.product.title,
            amount: -o.price, // Negative for spending
            status: o.status,
            date: o.createdAt,
            deliveryContent: (o as any).deliveryContent
        })),
        ...user.transactions.map(t => ({
            id: t.id,
            type: 'Deposit',
            description: `${t.asset} Top-up`,
            amount: t.amount,
            status: t.status,
            date: t.createdAt,
            deliveryContent: null
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

    return { ...user, activity };
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)
    if (!session) return null


    // Fetch real data from DB
    // Note: If DB connection fails (missing env), this will throw.
    // In a real scenario, we handle errors.
    let userData;
    try {
        userData = await getUserData(session.user.id);
    } catch (e) {
        console.error("Failed to fetch user data", e);
        // Fallback UI or simple error (for MVP dev flow where DB might be missing)
        return (
            <div className="p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive">
                <h3 className="font-bold">Database Connection Error</h3>
                <p>Please ensure DATABASE_URL is set in .env.</p>
            </div>
        );
    }

    if (!userData) return <div>User not found</div>

    return <DashboardClient userData={userData} />
}
