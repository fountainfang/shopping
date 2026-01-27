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
import { formatPrice } from "@/lib/utils"

export default function ClientBuyPage({ product, session, userBalance }: { product: any, session: any, userBalance: number }) {
    const { dict, language } = useLanguage()
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
    const [bookingTime, setBookingTime] = useState(initialTime)
    const [targetLink, setTargetLink] = useState("")
    const [additionalInfo, setAdditionalInfo] = useState("")

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
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-white">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px]" />
            </div>

            <nav className="h-20 border-b border-white/5 flex items-center px-4 md:px-8 justify-between relative z-10 bg-background/50 backdrop-blur-md">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors p-0 hover:bg-transparent"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </Button>
                <div className="flex gap-4 items-center">
                    <LanguageSwitcher />
                </div>
            </nav>

            <div className="flex-1 flex items-center justify-center p-4 relative z-10">
                <div className="max-w-lg w-full p-8 shadow-2xl border border-white/10 glass-card rounded-2xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4 text-primary">
                            <ShoppingBag className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{dict.buy.title}</h1>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white/5 p-6 rounded-xl space-y-3 border border-white/5">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">{dict.buy.productLabel}</span>
                                <span className="font-medium text-white text-lg">{product.title}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">{dict.buy.priceLabel}</span>
                                <span className="font-bold text-2xl text-primary">{formatPrice(product.price, language)}</span>
                            </div>
                        </div>

                        {/* Dynamic Inputs based on Type */}
                        {product.type === 'ATTRACTION' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
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
                                        className="bg-secondary/20 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20"
                                    />
                                </div>

                                {product.availableSlots && Array.isArray(product.availableSlots) && bookingDate && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Select Time Slot</label>
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
                                                            className={`w-full ${isSelected ? 'bg-primary hover:bg-primary/90 text-white border-transparent' : 'bg-secondary/20 border-white/10 text-muted-foreground hover:bg-secondary/30 hover:text-white'}`}
                                                            onClick={() => setBookingTime(time)}
                                                        >
                                                            {time}
                                                        </Button>
                                                    )
                                                })}
                                        </div>
                                        {product.availableSlots.filter((slot: string) => slot.startsWith(bookingDate)).length === 0 && (
                                            <p className="text-sm text-muted-foreground italic">No slots available for this date.</p>
                                        )}
                                    </div>
                                )}
                                {!bookingDate && (
                                    <p className="text-xs text-muted-foreground/60">Please select a date to see available slots.</p>
                                )}
                            </div>
                        )}

                        {product.type === 'CONCIERGE' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                    <LinkIcon className="w-4 h-4" />
                                    Target Link (Item to buy)
                                </label>
                                <Input
                                    placeholder="https://..."
                                    required
                                    value={targetLink}
                                    onChange={e => setTargetLink(e.target.value)}
                                    className="bg-secondary/20 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20"
                                />
                            </div>
                        )}

                        {product.type === 'THEATER' && (
                            <div className="space-y-4">
                                {product.availableSlots && product.availableSlots.length > 0 ? (
                                    <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                                        <label className="text-sm font-medium flex items-center gap-2 mb-2 text-primary">
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
                                        <div className="text-sm text-muted-foreground mt-2 flex gap-2 items-center">
                                            <Info className="w-4 h-4" />
                                            <span>Venue: {product.venue || 'Main Hall'}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            Select Date
                                        </label>
                                        <Input
                                            type="date"
                                            required
                                            value={bookingDate}
                                            onChange={e => setBookingDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="bg-secondary/20 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20"
                                        />
                                        <div className="text-xs text-muted-foreground mt-1 flex gap-1">
                                            <Info className="w-3 h-3" />
                                            <span>Venue: {product.venue || 'Main Hall'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {(product.type === 'CONCIERGE' || product.type === 'THEATER') && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Additional Notes</label>
                                <Input
                                    placeholder="Seat preference, account details, etc..."
                                    value={additionalInfo}
                                    onChange={e => setAdditionalInfo(e.target.value)}
                                    className="bg-secondary/20 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20"
                                />
                            </div>
                        )}

                        {isLoggedIn && (
                            <div className={`p-4 rounded-xl border ${canAfford ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
                                <div className="flex justify-between items-center">
                                    <span>{dict.buy.balanceLabel}</span>
                                    <span className="font-bold text-lg">{formatPrice(userBalance, language)}</span>
                                </div>
                                {!canAfford && (
                                    <p className="text-xs mt-2 font-medium flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {dict.buy.insufficientBalance}
                                    </p>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex gap-3 items-center text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {!isLoggedIn ? (
                            <Link href={`/auth/login?callbackUrl=/buy/${product.id}`}>
                                <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg shadow-lg shadow-primary/20" size="lg">
                                    {dict.buy.loginRequired}
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                className="w-full h-12 text-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                                size="lg"
                                onClick={onBuy}
                                disabled={loading || !canAfford}
                            >
                                {loading ? dict.buy.processing : dict.buy.confirmBtn}
                            </Button>
                        )}

                        <div className="text-center">
                            <Link href="/" className="text-sm text-muted-foreground hover:text-white hover:underline transition-colors">
                                {dict.buy.cancelBtn}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
