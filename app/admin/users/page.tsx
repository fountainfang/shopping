import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowUpRight } from "lucide-react"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: { wallet: true, _count: { select: { orders: true, transactions: true } } }
    })

    // Calculate total user details
    const totalBalance = users.reduce((acc, user) => acc + user.balance, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total User Balance</p>
                        <p className="font-bold text-lg">${totalBalance.toFixed(2)}</p>
                    </div>
                    {/* Funds Sweep Button - This would trigger the sweep API */}
                    <form action="/api/admin/funds-sweep" method="POST">
                        <Button variant="destructive" className="gap-2">
                            <ArrowUpRight className="w-4 h-4" />
                            Sweep Funds
                        </Button>
                    </form>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                            <th className="px-6 py-3 font-medium">Email</th>
                            <th className="px-6 py-3 font-medium">Role</th>
                            <th className="px-6 py-3 font-medium">Balance</th>
                            <th className="px-6 py-3 font-medium">Wallet Address</th>
                            <th className="px-6 py-3 font-medium">Orders</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 font-medium">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">${user.balance.toFixed(2)}</td>
                                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                    {user.wallet?.address || "-"}
                                </td>
                                <td className="px-6 py-4">{user._count.orders}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
