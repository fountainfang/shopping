"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/i18n/LanguageContext"

export function DateFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { dict } = useLanguage()

    const currentDate = searchParams.get('date') || ""

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value
        if (date) {
            router.push(`${pathname}?date=${date}`)
        } else {
            router.push(pathname)
        }
    }

    return (
        <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
            <span className="text-sm text-slate-400 font-medium whitespace-nowrap px-2">
                Filter by Date:
            </span>
            <Input
                type="date"
                value={currentDate}
                onChange={handleDateChange}
                className="w-auto h-9 bg-slate-800 border-slate-700 text-slate-200"
            />
            {currentDate && (
                <button
                    onClick={() => router.push(pathname)}
                    className="text-xs text-slate-500 hover:text-white px-2"
                >
                    Clear
                </button>
            )}
        </div>
    )
}
