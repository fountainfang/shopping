"use client"

import Link from "next/link"
import { Home, ShoppingBag, Wallet, Settings, ShieldCheck } from "lucide-react"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { cn } from "@/lib/utils"

interface SidebarProps {
    user: {
        email?: string | null
        role?: string
    } | undefined
}

export function Sidebar({ user }: SidebarProps) {
    const { dict } = useLanguage()

    return (
        <aside className="w-64 border-r border-border hidden md:flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                    V-Ticket
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium transition-colors">
                    <Home className="w-5 h-5" />
                    {dict.common.dashboard}
                </Link>
                <Link href="/dashboard/shop" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <ShoppingBag className="w-5 h-5" />
                    {dict.common.shop}
                </Link>
                <Link href="/dashboard/wallet" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Wallet className="w-5 h-5" />
                    {dict.common.wallet}
                </Link>
                <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Settings className="w-5 h-5" />
                    {dict.common.settings}
                </Link>
                {user?.role === 'admin' && (
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-destructive hover:text-destructive transition-colors">
                        <ShieldCheck className="w-5 h-5" />
                        {dict.common.adminPanel}
                    </Link>
                )}
            </nav>

            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium text-foreground">{user?.email}</p>
                        <p className="text-xs truncate">User</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
