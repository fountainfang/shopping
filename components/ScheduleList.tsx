"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { Calendar } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export function ScheduleList({ products }: { products: any[] }) {
    const { dict, language } = useLanguage()

    if (products.length === 0) return null

    // 1. Flatten all products into Event Instances
    // Each date in availableSlots becomes a row.
    // If no slots, it's a "general" product (shown once, maybe at top or bottom? Or ignored?)
    // For now, if no slots, we default to "Date TBA" and show it once.

    const allEvents: any[] = []

    products.forEach(product => {
        const slots = (Array.isArray(product.availableSlots) ? product.availableSlots : []) as string[]

        // Detect Type Badge
        let badgeType = "Other"
        const lowerDesc = (product.description || "").toLowerCase() + (product.title || "").toLowerCase() + (product.titleRu || "").toLowerCase() + (product.descriptionRu || "").toLowerCase()

        if (lowerDesc.includes("ballet") || lowerDesc.includes("ballerina") || lowerDesc.includes("swan lake") || lowerDesc.includes("балет") || lowerDesc.includes("芭蕾")) {
            badgeType = "Ballet"
        } else if (lowerDesc.includes("opera") || lowerDesc.includes("soprano") || lowerDesc.includes("опера") || lowerDesc.includes("歌剧")) {
            badgeType = "Opera"
        } else if (lowerDesc.includes("concert") || lowerDesc.includes("symphony") || lowerDesc.includes("piano") || lowerDesc.includes("orchestra") || lowerDesc.includes("концерт") || lowerDesc.includes("音乐会")) {
            badgeType = "Concert"
        }

        if (slots.length > 0) {
            slots.forEach(slot => {
                allEvents.push({
                    ...product,
                    instanceId: `${product.id}-${slot}`,
                    slotInfo: slot, // "YYYY-MM-DD HH:mm"
                    dateObj: new Date(slot),
                    badgeType
                })
            })
        } else {
            // No slots (e.g. Concierge or Virtual generic)
            allEvents.push({
                ...product,
                instanceId: product.id,
                slotInfo: null,
                dateObj: new Date(2099, 0, 1), // Push to end
                badgeType: "Service"
            })
        }
    })

    // 2. Sort by Date
    allEvents.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

    // 3. Filter Past Events (Optional, but good UX)
    // const now = new Date()
    // const futureEvents = allEvents.filter(e => e.dateObj >= now) 
    // (Keeping all for demo purposes or exact logic?) 
    // Let's keep all for now until told dates are strictly future.

    // Helper for Badge Color
    const getBadgeColor = (type: string) => {
        switch (type) {
            case "Ballet": return "bg-purple-500/20 text-purple-300 border-purple-500/30"
            case "Opera": return "bg-blue-500/20 text-blue-300 border-blue-500/30"
            case "Concert": return "bg-amber-500/20 text-amber-300 border-amber-500/30"
            default: return "bg-slate-700/50 text-slate-300 border-slate-600"
        }
    }

    return (
        <div className="w-full space-y-4">
            {/* Header / Legend (Optional) */}

            <div className="space-y-2">
                {allEvents.map((item) => {
                    // Date Formatting
                    let dateDisplay = "TBA"
                    let timeDisplay = ""

                    if (item.slotInfo) {
                        // Check if valid date
                        if (!isNaN(item.dateObj.getTime())) {
                            dateDisplay = item.dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) // "Jan 26"
                            timeDisplay = item.dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }) // "19:00"
                        } else {
                            dateDisplay = item.slotInfo
                        }
                    }

                    const displayTitle = (language === 'zh' ? item.titleZh : language === 'ru' ? item.titleRu : item.title) || item.title
                    const displayDesc = (language === 'zh' ? item.descriptionZh : language === 'ru' ? item.descriptionRu : item.description) || item.description

                    const buyUrl = `/buy/${item.id}${item.slotInfo ? `?slot=${encodeURIComponent(item.slotInfo)}` : ''}`

                    // Row Layout
                    return (
                        <div key={item.instanceId} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-lg bg-slate-900/40 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-900/60 transition-all group">

                            {/* Date Column */}
                            <div className="flex-shrink-0 w-24 flex flex-col items-center justify-center p-2 rounded bg-slate-950/50 border border-slate-800/50">
                                <span className="text-lg font-bold text-white leading-none">{dateDisplay}</span>
                                <span className="text-sm text-teal-400 font-mono mt-1">{timeDisplay}</span>
                            </div>

                            {/* Main Content */}
                            <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${getBadgeColor(item.badgeType)}`}>
                                        {item.badgeType}
                                    </span>
                                    <h3 className="text-base md:text-lg font-bold text-white truncate group-hover:text-teal-300 transition-colors">
                                        {displayTitle}
                                    </h3>
                                </div>
                                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                                    {displayDesc}
                                </p>
                            </div>

                            {/* Venue & Action */}
                            <div className="flex-shrink-0 w-full md:w-48 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end gap-3 md:gap-1 pl-0 md:pl-4 md:border-l border-slate-800">
                                <span className="text-xs text-slate-500 text-right">{item.venue || item.location}</span>

                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-white text-lg">{formatPrice(item.price, language)}</span>
                                    <Link href={buyUrl}>
                                        <Button size="sm" className="h-8 bg-teal-600 hover:bg-teal-500 text-white rounded-full px-4">
                                            Buy
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                        </div>
                    )
                })}
            </div>

            {allEvents.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    No events found.
                </div>
            )}
        </div>
    )
}
