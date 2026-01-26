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
    const [selectedDate, setSelectedDate] = useState("")

    if (products.length === 0) return null

    // Determine Mode: If all products are ATTRACTION, use strict date picker mode.
    const isAttractionMode = products.every(p => p.type === 'ATTRACTION')

    // 1. Process Logic
    let displayItems: any[] = []

    if (isAttractionMode) {
        // ATTRACTION MODE: Expand Slots
        // If date is selected, filter by date.
        // If no date, show distinct products (Aggregated) OR show next slots?
        // User said: "not selected -> show next dates, selected -> show only that date"

        products.forEach(product => {
            const slots = (Array.isArray(product.availableSlots) ? product.availableSlots : []) as string[]

            // If selectedDate is set, filter slots
            const filteredSlots = selectedDate
                ? slots.filter(s => s.startsWith(selectedDate))
                : slots.filter(s => new Date(s) >= new Date()) // Future only by default

            // Create display items from slots
            filteredSlots.forEach(slot => {
                displayItems.push({
                    ...product,
                    virtualId: `${product.id}-${slot}`, // Unique key
                    slotInfo: slot, // "YYYY-MM-DD HH:mm"
                    isSpecificSlot: true
                })
            })
        })

        // Sort by time
        displayItems.sort((a, b) => a.slotInfo.localeCompare(b.slotInfo))

        // Limit if no date selected to avoid spam? Lets show 20 max.
        if (!selectedDate && displayItems.length > 20) {
            displayItems = displayItems.slice(0, 20)
        }

    } else {
        // STANDARD MODE (Theaters): Product = Event
        displayItems = [...products].sort((a, b) => {
            const dateA = a.availableSlots && Array.isArray(a.availableSlots) ? String(a.availableSlots[0]) : ""
            const dateB = b.availableSlots && Array.isArray(b.availableSlots) ? String(b.availableSlots[0]) : ""
            return dateA.localeCompare(dateB)
        })
    }

    // If attraction mode and no results for date
    if (isAttractionMode && displayItems.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4 bg-teal-900/20 p-4 rounded-lg border border-teal-800/30">
                    <label className="text-sm font-medium text-teal-200">Select Date:</label>
                    <Input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="max-w-[200px] bg-black/40 border-teal-700/50 text-white"
                    />
                </div>
                <div className="p-8 text-center text-muted-foreground bg-teal-900/10 rounded-lg">
                    No slots available for this date.
                </div>
            </div>
        )
    }

    return (
        <div className="w-full text-left border-collapse space-y-4">
            {isAttractionMode && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-teal-900/30 p-4 rounded-lg border border-teal-700/30 mb-6">
                    <label htmlFor="date-picker-input" className="flex items-center gap-2 text-teal-100 cursor-pointer hover:text-white transition-colors">
                        <Calendar className="w-5 h-5" />
                        <span className="font-semibold">Check Availability</span>
                    </label>
                    <div className="relative">
                        <Input
                            id="date-picker-input"
                            type="date"
                            style={{ colorScheme: "dark" }}
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            className="max-w-[200px] bg-black/40 border-teal-600/50 text-white focus:border-teal-400 cursor-pointer"
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    {!selectedDate && <span className="text-xs text-teal-400/70 italic">Showing upcoming slots</span>}
                    {selectedDate && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDate("")}
                            className="text-teal-400 hover:text-white h-8 px-2"
                        >
                            Clear
                        </Button>
                    )}
                </div>
            )}

            <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-bold text-teal-200 border-b border-teal-700/50 pb-2 mb-4 px-4">
                <div className="col-span-3">Date & Time</div>
                <div className="col-span-5">Performance / Item</div>
                <div className="col-span-2">Venue</div>
                <div className="col-span-2 text-right">Price</div>
            </div>

            <div className="space-y-3">
                {displayItems.map((item) => {
                    // Logic for time formatting
                    let dateFormatted = "TBA"
                    let timeFormatted = ""
                    let slotStr = ""

                    if (item.isSpecificSlot) {
                        slotStr = item.slotInfo
                    } else if (item.availableSlots && Array.isArray(item.availableSlots)) {
                        slotStr = String(item.availableSlots[0])
                    }

                    if (slotStr) {
                        const dateObj = new Date(slotStr)
                        if (!isNaN(dateObj.getTime())) {
                            dateFormatted = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })
                            timeFormatted = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                        } else {
                            dateFormatted = slotStr
                        }
                    }

                    // Resolve Multilingual Title/Desc
                    const displayTitle = (language === 'zh' ? item.titleZh : language === 'ru' ? item.titleRu : item.title) || item.title
                    const displayDesc = (language === 'zh' ? item.descriptionZh : language === 'ru' ? item.descriptionRu : item.description) || item.description

                    // Construct Buy URL
                    // If specific slot, can pre-fill? currently /buy/[id] checks state. 
                    // To support pre-fill, we'd need ClientBuyPage to read searchParams? 
                    // For now, simple link.
                    const buyUrl = `/buy/${item.id}${item.isSpecificSlot ? `?slot=${encodeURIComponent(item.slotInfo)}` : ''}`

                    return (
                        <div key={item.virtualId || item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-teal-900/30 hover:bg-teal-800/50 p-4 rounded-lg transition-colors border border-teal-800/30">
                            <div className="col-span-12 md:col-span-3 flex md:flex-col gap-2 md:gap-0">
                                <span className="text-white font-medium">{dateFormatted}</span>
                                <span className="text-teal-300">{timeFormatted}</span>
                            </div>
                            <div className="col-span-12 md:col-span-5">
                                <h3 className="text-lg font-bold text-white">{displayTitle}</h3>
                                <p className="text-sm text-teal-300 line-clamp-1">{displayDesc}</p>
                            </div>
                            <div className="col-span-6 md:col-span-2 text-sm text-teal-200">
                                {item.venue || item.location}
                            </div>
                            <div className="col-span-6 md:col-span-2 flex flex-col items-end gap-2">
                                <span className="font-bold text-white">{formatPrice(item.price, language)}</span>
                                <Link href={buyUrl} className="w-full md:w-auto">
                                    <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-500 text-white border-none py-1 h-8">
                                        {dict.home.buyNow}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
