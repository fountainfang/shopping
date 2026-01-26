"use client"

import { Wallet, RefreshCw, Plus, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { useState } from "react"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export default function ClientDashboard({ userData }: { userData: any }) {
    const { dict } = useLanguage()
    const [refreshing, setRefreshing] = useState(false)

    async function onRefreshBalance() {
        setRefreshing(true)
        try {
            const res = await fetch("/api/user/refresh-balance", { method: "POST" })
            if (!res.ok) throw new Error("Failed to refresh")
            window.location.reload()
        } catch (e) {
            console.error("Failed to refresh balance")
        } finally {
            setRefreshing(false)
        }
    }

    const { balance, wallet, activity } = userData

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">{dict.common.dashboard}</h2>
                <div className="flex gap-4 items-center">
                    <LanguageSwitcher />
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">{dict.dashboard.totalBalance}</p>
                            <h3 className="text-3xl font-bold mt-2">${balance.toFixed(2)}</h3>
                        </div>
                        <div className="p-2 bg-primary/20 rounded-lg text-primary">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button size="sm" className="w-full" disabled={refreshing} onClick={onRefreshBalance}>
                            {refreshing ? dict.common.loading : dict.dashboard.refreshBalance} <RefreshCw className={`w-3 h-3 ml-2 ${refreshing ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </div>

                <div className="glass-card p-6 md:col-span-2">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">{dict.dashboard.depositAddress}</p>
                            <div className="flex items-center gap-2 mt-2 p-2 bg-muted/50 rounded-lg border border-border/50">
                                <code className="text-sm font-mono text-primary break-all">
                                    {wallet?.address || "Loading..."}
                                </code>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 hover:bg-background/80"
                                    onClick={() => navigator.clipboard.writeText(wallet?.address)}
                                >
                                    <Plus className="w-4 h-4 rotate-45" /> {/* Use Plus as Copy icon for now or standard copy */}
                                </Button>
                            </div>
                        </div>
                        <div className="p-2 bg-secondary/20 rounded-lg text-secondary-foreground">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                        <p>{dict.dashboard.depositInstructions}</p>
                    </div>
                </div>
            </div>

            {/* Activity Table */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">{dict.dashboard.recentActivity}</h3>
                <div className="glass-card overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3 font-medium">{dict.activity.type}</th>
                                <th className="px-6 py-3 font-medium">{dict.activity.description}</th>
                                <th className="px-6 py-3 font-medium">{dict.activity.amount}</th>
                                <th className="px-6 py-3 font-medium">{dict.activity.status}</th>
                                <th className="px-6 py-3 font-medium text-right">{dict.activity.date}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {activity.map((item: any) => (
                                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${item.type === 'Type' ? 'bg-primary' : 'bg-green-500'}`} />
                                        {item.type === 'Purchase' ? dict.activity.purchase : dict.activity.deposit}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            {item.description}
                                            {/* Show delivery content if available */}
                                            {item.deliveryContent && (
                                                <div className="mt-1 p-2 bg-muted/50 rounded border border-border/50 text-xs font-mono text-primary break-all">
                                                    <span className="font-bold text-muted-foreground select-none mr-2">{dict.activity.delivery}:</span>
                                                    {item.deliveryContent}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 font-mono ${item.amount > 0 ? 'text-green-500' : 'text-foreground'}`}>
                                        {item.amount > 0 ? '+' : ''}{item.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'completed' || item.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-muted-foreground">
                                        {new Date(item.date).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
