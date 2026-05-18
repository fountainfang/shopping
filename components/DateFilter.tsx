"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/i18n/LanguageContext"

export function DateFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { dict } = useLanguage()

    const startDate = searchParams.get('startDate') || ""
    const endDate = searchParams.get('endDate') || ""

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value
        updateUrl(newStartDate, endDate)
    }

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = e.target.value
        updateUrl(startDate, newEndDate)
    }

    const updateUrl = (start: string, end: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (start) {
            params.set('startDate', start)
        } else {
            params.delete('startDate')
        }
        
        if (end) {
            params.set('endDate', end)
        } else {
            params.delete('endDate')
        }

        const queryString = params.toString()
        router.push(queryString ? `${pathname}?${queryString}` : pathname)
    }

    const handleClear = () => {
        router.push(pathname)
    }

    return (
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
            <span className="text-sm text-slate-400 font-medium whitespace-nowrap px-2">
                Filter by Date:
            </span>
            <div className="flex items-center gap-2">
                <Input
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    className="w-auto h-9 bg-slate-800 border-slate-700 text-slate-200"
                    placeholder="Start Date"
                />
                <span className="text-slate-500">-</span>
                <Input
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    className="w-auto h-9 bg-slate-800 border-slate-700 text-slate-200"
                    placeholder="End Date"
                />
            </div>
            {(startDate || endDate) && (
                <button
                    onClick={handleClear}
                    className="text-xs text-slate-500 hover:text-white px-2"
                >
                    Clear
                </button>
            )}
        </div>
    )
}
