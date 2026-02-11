"use client"

// import Link from "next/link"
import { LogOut } from "lucide-react"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { SimpleLanguageSwitcher } from "@/components/SimpleLanguageSwitcher"

export function DashboardHeader() {
    const { dict } = useLanguage()

    return (
        <header className="h-16 border-b border-border flex items-center justify-between px-6 md:px-10">
            <h2 className="text-lg font-medium">{dict.common.dashboard}</h2>
            <div className="flex items-center gap-4">
                <SimpleLanguageSwitcher />
                <button
                    onClick={() => import("next-auth/react").then(async ({ signOut }) => {
                        await signOut({ redirect: false });
                        window.location.href = window.location.origin;
                    })}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    {dict.common.logout}
                </button>
            </div>
        </header>
    )
}
