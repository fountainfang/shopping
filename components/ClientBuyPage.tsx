"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle, AlertCircle, ShoppingBag, Calendar, Link as LinkIcon, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

import { useSearchParams } from "next/navigation"

export default function ClientBuyPage({ product, session, userBalance }: { product: any, session: any, userBalance: number }) {
    const { dict } = useLanguage()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Parse initial slot from URL if present "YYYY-MM-DD HH:mm"
    const slotParam = searchParams.get('slot')
    let initialDate = ""
    let initialTime = ""

    if (slotParam) {
        const parts = slotParam.split(' ')
        if (parts.length >= 1) initialDate = parts[0]
        if (parts.length >= 2) initialTime = parts[1]
    }

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // New State for optional fields
    const [bookingDate, setBookingDate] = useState(initialDate)
    const [bookingTime, setBookingTime] = useState(initialTime) // Attraction might need time
    const [targetLink, setTargetLink] = useState("")
    const [additionalInfo, setAdditionalInfo] = useState("")

    // Let's use `multi_replace_file_content` to fix both.
    // But I am restricted to `replace_file_content` if it's a "single contiguous block" rule, but correcting an import + this block is non-contiguous.
    // I'll use `multi_replace_file_content`.


    if (!product) return <div className="p-8 text-center text-muted-foreground">Product not found</div>

    const canAfford = userBalance >= product.price
    const isLoggedIn = !!session

    async function onBuy() {
        if (!isLoggedIn) {
            router.push("/auth/login")
            return
        }
        if (!canAfford) {
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/orders/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: product.id,
                    bookingDate: bookingDate ? new Date(bookingDate + (bookingTime ? 'T' + bookingTime : '')).toISOString() : null,
                    targetLink,
                    additionalInfo
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Purchase failed")
            }

            // Success, redirect to dashboard
            router.push("/dashboard")
            router.refresh()
        } catch (e: any) {
            setError(e.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-teal-500 selection:text-white">
            <nav className="h-16 border-b border-slate-800 flex items-center px-4 md:px-8 justify-between bg-slate-950">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-0 hover:bg-transparent"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </Button>
                <div className="flex gap-4 items-center">
                    <LanguageSwitcher />
                </div>
            </nav>

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-lg w-full p-8 shadow-2xl border border-slate-800 bg-slate-900/90 rounded-2xl backdrop-blur-md">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center p-4 bg-teal-500/10 rounded-full mb-4 text-teal-400">
                            <ShoppingBag className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">{dict.buy.title}</h1>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-800/50 p-4 rounded-lg space-y-2 border border-slate-700">
                            <div className="flex justify-between">
                                <span className="text-slate-400">{dict.buy.productLabel}</span>
                                <span className="font-medium text-white">{product.title}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">{dict.buy.priceLabel}</span>
                                <span className="font-bold text-xl text-white">${product.price.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Dynamic Inputs based on Type */}
                        {product.type === 'ATTRACTION' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2 text-slate-300">
                                        <Calendar className="w-4 h-4" />
                                        Select Date
                                    </label>
                                    <Input
                                        type="date"
                                        required
                                        style={{ colorScheme: "dark" }}
                                        value={bookingDate}
                                        onChange={e => {
                                            setBookingDate(e.target.value)
                                            setBookingTime("") // Reset time when date changes
                                        }}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="bg-slate-800 border-slate-700 text-white focus:border-teal-500"
                                    />
                                </div>

                                {product.availableSlots && Array.isArray(product.availableSlots) && bookingDate && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Select Time Slot</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {product.availableSlots
                                                .filter((slot: string) => slot.startsWith(bookingDate))
                                                .map((slot: string, i: number) => {
                                                    const time = slot.split(' ')[1];
                                                    const isSelected = bookingTime === time;
                                                    return (
                                                        <Button
                                                            key={i}
                                                            type="button"
                                                            variant={isSelected ? "default" : "outline"}
                                                            className={`w-full ${isSelected ? 'bg-teal-600 hover:bg-teal-500 text-white border-transparent' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                                                            onClick={() => setBookingTime(time)}
                                                        >
                                                            {time}
                                                        </Button>
                                                    )
                                                })}
                                        </div>
                                        {product.availableSlots.filter((slot: string) => slot.startsWith(bookingDate)).length === 0 && (
                                            <p className="text-sm text-slate-500 italic">No slots available for this date.</p>
                                        )}
                                    </div>
                                )}
                                {!bookingDate && (
                                    <p className="text-xs text-slate-500">Please select a date to see available slots.</p>
                                )}
                            </div>
                        )}

                        {product.type === 'CONCIERGE' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2 text-slate-300">
                                    <LinkIcon className="w-4 h-4" />
                                    Target Link (Item to buy)
                                </label>
                                <Input
                                    placeholder="https://..."
                                    required
                                    value={targetLink}
                                    onChange={e => setTargetLink(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white focus:border-teal-500"
                                />
                            </div>
                        )}

                        {product.type === 'THEATER' && (
                            <div className="space-y-4">
                                {product.availableSlots && product.availableSlots.length > 0 ? (
                                    // Single Event specific logic
                                    <div className="bg-teal-900/20 p-4 rounded-lg border border-teal-800/50">
                                        <label className="text-sm font-medium flex items-center gap-2 mb-2 text-teal-400">
                                            <Calendar className="w-4 h-4" />
                                            Event Details
                                        </label>
                                        <div className="text-lg font-bold text-white">
                                            {(() => {
                                                const slot = product.availableSlots[0];
                                                const [date, time] = slot.split(' ');
                                                return `${date} at ${time}`
                                            })()}
                                        </div>
                                        <div className="text-sm text-slate-400 mt-1 flex gap-1 items-center">
                                            <Info className="w-3 h-3" />
                                            <span>Venue: {product.venue || 'Main Hall'}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2 text-slate-300">
                                            <Calendar className="w-4 h-4" />
                                            Select Date
                                        </label>
                                        <Input
                                            type="date"
                                            required
                                            value={bookingDate}
                                            onChange={e => setBookingDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="bg-slate-800 border-slate-700 text-white focus:border-teal-500"
                                        />
                                        <div className="text-xs text-slate-500 mt-1 flex gap-1">
                                            <Info className="w-3 h-3" />
                                            <span>Venue: {product.venue || 'Main Hall'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {(product.type === 'CONCIERGE' || product.type === 'THEATER') && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Additional Notes</label>
                                <Input
                                    placeholder="Seat preference, account details, etc..."
                                    value={additionalInfo}
                                    onChange={e => setAdditionalInfo(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white focus:border-teal-500"
                                />
                            </div>
                        )}

                        {isLoggedIn && (
                            <div className={`p-4 rounded-lg border ${canAfford ? 'bg-green-900/20 border-green-800/50 text-green-400' : 'bg-red-900/20 border-red-800/50 text-red-400'}`}>
                                <div className="flex justify-between items-center">
                                    <span>{dict.buy.balanceLabel}</span>
                                    <span className="font-bold">${userBalance.toFixed(2)}</span>
                                </div>
                                {!canAfford && (
                                    <p className="text-xs mt-2 font-medium">{dict.buy.insufficientBalance}</p>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-900/20 border border-red-800/50 text-red-400 rounded-md flex gap-2 items-center text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {!isLoggedIn ? (
                            <Link href={`/auth/login?callbackUrl=/buy/${product.id}`}>
                                <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white" size="lg">
                                    {dict.buy.loginRequired}
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                className="w-full h-12 text-lg shadow-lg shadow-teal-900/20 bg-teal-600 hover:bg-teal-500 text-white border-none"
                                size="lg"
                                onClick={onBuy}
                                disabled={loading || !canAfford}
                            >
                                {loading ? dict.buy.processing : dict.buy.confirmBtn}
                            </Button>
                        )}

                        <div className="text-center">
                            <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 hover:underline">
                                {dict.buy.cancelBtn}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
