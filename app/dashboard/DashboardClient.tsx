"use client"

import { useLanguage } from "@/lib/i18n/LanguageContext"
import { Wallet, RefreshCw, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardClientProps {
    userData: {
        balance: number;
        wallet: { address: string } | null;
        activity: any[];
    }
}

export default function DashboardClient({ userData }: DashboardClientProps) {
    const { dict } = useLanguage()

    return (
        <div className="space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">{dict.dashboard.totalBalance}</p>
                            <h3 className="text-3xl font-bold mt-2">${userData.balance.toFixed(2)}</h3>
                        </div>
                        <div className="p-2 bg-primary/20 rounded-lg text-primary">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button size="sm" className="w-full">
                            {dict.activity.deposit}
                        </Button>
                    </div>
                </div>

                <div className="glass-card p-6 md:col-span-2">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">{dict.dashboard.depositAddress}</p>
                            <p className="text-xs text-muted-foreground mt-1">{dict.dashboard.depositInstructions}</p>
                        </div>
                        <div className="p-2 bg-secondary/20 rounded-lg text-secondary">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border flex items-center justify-between font-mono text-sm break-all">
                        {userData.wallet?.address || "Address generation pending..."}
                        <Button variant="ghost" size="sm" className="ml-2 gap-2">
                            {dict.dashboard.copy}
                        </Button>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <form action="/api/user/refresh-balance" method="POST">
                            <Button variant="outline" size="sm" className="gap-2">
                                <RefreshCw className="w-4 h-4" />
                                {dict.dashboard.refreshBalance}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">{dict.dashboard.recentActivity}</h3>
                <div className="glass-card p-0 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3 font-medium">{dict.activity.type}</th>
                                <th className="px-6 py-3 font-medium">{dict.activity.description}</th>
                                <th className="px-6 py-3 font-medium">{dict.activity.amount}</th>
                                <th className="px-6 py-3 font-medium">{dict.activity.status}</th>
                                <th className="px-6 py-3 font-medium">{dict.activity.date}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {userData.activity.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        {dict.dashboard.noActivity}
                                    </td>
                                </tr>
                            ) : (
                                userData.activity.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium">
                                            {item.type === 'Purchase' ? dict.activity.purchase : dict.activity.deposit}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>{item.description}</div>
                                            {item.deliveryContent && (
                                                <div className="mt-1 text-xs bg-muted p-2 rounded border border-border font-mono break-all text-primary">
                                                    {dict.activity.delivery}: {item.deliveryContent}
                                                </div>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 font-medium ${item.amount > 0 ? 'text-green-500' : 'text-foreground'}`}>
                                            {item.amount > 0 ? '+' : ''}{item.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs text-center border ${item.status === 'completed' || item.status === 'paid'
                                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{new Date(item.date).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
