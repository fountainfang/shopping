import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Wallet, ArrowDownLeft, ArrowUpRight, History, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export const dynamic = 'force-dynamic'

async function getUserWallet(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            wallet: true,
            transactions: {
                orderBy: { createdAt: 'desc' },
                take: 10
            }
        }
    })
    return user
}

export default async function WalletPage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
        redirect("/auth/login")
    }

    const userData = await getUserWallet(session.user.id!)

    if (!userData) {
        return <div>User not found</div>
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Wallet</h2>
                    <p className="text-muted-foreground">
                        Manage your balance and transactions.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Balance Card */}
                <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-400">$ {userData.balance.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Available for purchases
                        </p>
                    </CardContent>
                </Card>

                {/* Deposit Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deposit Address (USDT/USDC - BEP20)</CardTitle>
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        {userData.wallet ? (
                            <div className="space-y-2">
                                <div className="p-3 bg-muted rounded-md font-mono text-xs break-all flex items-center justify-between gap-2">
                                    <span>{userData.wallet.address}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Send only USDT or USDC (BEP20) to this address.
                                </p>
                            </div>
                        ) : (
                            <div className="text-sm text-yellow-500 flex items-center gap-2">
                                <span>No wallet address generated. Contact support.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Transactions */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-xl font-semibold">Transaction History</h3>
                </div>

                <div className="glass-card overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3 font-medium">Type</th>
                                <th className="px-6 py-3 font-medium">Asset</th>
                                <th className="px-6 py-3 font-medium">Amount</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {userData.transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {tx.amount > 0 ? (
                                                <ArrowDownLeft className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <ArrowUpRight className="w-4 h-4 text-red-500" />
                                            )}
                                            {tx.amount > 0 ? "Deposit" : "Payment"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{tx.asset}</td>
                                    <td className={`px-6 py-4 font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {tx.amount > 0 ? "+" : ""}{tx.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold">
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-muted-foreground">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {userData.transactions.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground">
                            No transactions found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
