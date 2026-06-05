"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle, AlertCircle, ShoppingBag, Calendar, Link as LinkIcon, Info, User, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

import { useSearchParams } from "next/navigation"
import { formatPrice } from "@/lib/utils"
import { useWorkerPrice } from "@/lib/hooks/useWorkerPrice"
import { Loader2 } from "lucide-react"

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
    const [surname, setSurname] = useState("")
    const [givenName, setGivenName] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    // Purchasing Service Logic
    const [rubleAmount, setRubleAmount] = useState("")
    const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null)
    const [calculationDetails, setCalculationDetails] = useState<any>(null)
    const [rmbDisplayPrice, setRmbDisplayPrice] = useState<number | null>(null)
    const [calculating, setCalculating] = useState(false)
    const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, string>>({})

    // Fetch price for standard products (Attraction/Theater)
    const { prices: standardPrices, isLoading: isLoadingPrice } = useWorkerPrice(
        product.type !== 'CONCIERGE' ? product.price : null
    )

    useEffect(() => {
        if (product.type !== 'CONCIERGE' || !rubleAmount) {
            setCalculatedPrice(null)
            setRmbDisplayPrice(null)
            return
        }

        const timer = setTimeout(async () => {
            setCalculating(true)
            try {
                const numAmount = parseFloat(rubleAmount) || 0;
                let markupPercent = 0;
                let markupFixed = 0;

                if (product.markupRules && Array.isArray(product.markupRules)) {
                    const rule = product.markupRules.find((r: any) => numAmount >= r.min && numAmount <= r.max);
                    if (rule) {
                        markupPercent = rule.percent || 0;
                        markupFixed = rule.fixed || 0;
                    }
                }
                const finalRubleAmount = numAmount * (1 + markupPercent / 100) + markupFixed;

                const res = await fetch(`https://lolzteam.fountain-fang.workers.dev/?amount=${finalRubleAmount}`)
                const data = await res.json()

                // Logic: (Taobao Price / Rate)
                // Keys from user: "淘宝价格", "人民币usdt汇率"
                const tbPrice = data["淘宝价格"]
                const rate = data["人民币usdt汇率"]

                if (tbPrice && rate) {
                    const final = tbPrice / rate
                    setCalculatedPrice(final)
                    setRmbDisplayPrice(tbPrice)
                    setCalculationDetails(data)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setCalculating(false)
            }
        }, 800) // Debounce

        return () => clearTimeout(timer)
    }, [rubleAmount, product.type, product.markupRules])

    if (!product) return <div className="p-8 text-center text-muted-foreground">Product not found</div>

    // Effective Price: Dynamic if Concierge, else use Worker USD Price for check
    // If standard product, effectivePrice should be the USDT cost (approx worker USD price)
    // We use a fallback if loading, but typically we want to block buy if loading
    const standardUsdPrice = standardPrices?.["美元价格"] || 0

    const effectivePrice = product.type === 'CONCIERGE'
        ? (calculatedPrice || 0)
        : standardUsdPrice

    // Balance Check uses effective price
    const canAfford = userBalance >= effectivePrice
    const isLoggedIn = !!session

    async function onBuy() {
        if (!isLoggedIn) {
            router.push("/auth/login")
            return
        }
        if (!canAfford) {
            return
        }

        let mainTargetLink = targetLink;
        let serializedDynamicFields = "";

        if (product.type === 'CONCIERGE') {
            const hasDynamicFields = Array.isArray(product.conciergeFields) && product.conciergeFields.length > 0;

            if (hasDynamicFields) {
                // Validate required fields
                for (const field of product.conciergeFields) {
                    if (field.required && !dynamicFieldValues[field.name]) {
                        setError(`"${field.label || field.name}" is required`);
                        return;
                    }
                }

                // Serialize values
                serializedDynamicFields = product.conciergeFields.map((f: any) => {
                    const val = dynamicFieldValues[f.name] || "";
                    return `${f.label || f.name}: ${val}`;
                }).join(" | ");

                // Set mainTargetLink
                const urlField = product.conciergeFields.find((f: any) => f.name === 'targetLink' || f.name === 'url' || f.type === 'url');
                if (urlField) {
                    mainTargetLink = dynamicFieldValues[urlField.name] || "";
                } else {
                    const firstField = product.conciergeFields[0];
                    mainTargetLink = dynamicFieldValues[firstField.name] || "";
                }
            } else {
                // Fallback to standard targetLink
                if (!targetLink) {
                    setError("Target Link is required");
                    return;
                }
            }
        }

        if (product.type === 'ATTRACTION') {
            if (!surname || !givenName || !phoneNumber) {
                setError("Please fill in all contact details (Surname, Given Name, Phone Number)")
                return
            }
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
                    targetLink: mainTargetLink,
                    // Pass dynamic price for Concierge
                    price: product.type === 'CONCIERGE' ? effectivePrice : undefined,
                    additionalInfo: product.type === 'CONCIERGE'
                        ? `Amount: ${rubleAmount} RUB | Rate: ${calculationDetails?.["人民币usdt汇率"]} | TB: ${calculationDetails?.["淘宝价格"]} | Cost: ${calculationDetails?.["成本"]}. ${serializedDynamicFields ? serializedDynamicFields + " | " : ""}${additionalInfo}`
                        : product.type === 'ATTRACTION'
                            ? ` Surname: ${surname} | Given Name: ${givenName} | Phone: ${phoneNumber} | ${additionalInfo}`
                            : additionalInfo
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
                                <div className="text-right">
                                    <span className="font-bold text-2xl text-primary">
                                        {(() => {
                                            if (product.type === 'CONCIERGE') {
                                                if (calculatedPrice !== null) {
                                                    if (language === 'zh' && rmbDisplayPrice) {
                                                        return `¥${rmbDisplayPrice}`
                                                    }
                                                    return `$${calculatedPrice.toFixed(2)}`
                                                }
                                                return "---"
                                            }

                                            // Standard Product Display
                                            if (isLoadingPrice) return <Loader2 className="w-5 h-5 animate-spin inline" />
                                            if (!standardPrices) return "Error"

                                            if (language === 'zh') {
                                                const cny = standardPrices["不走淘宝价格"]
                                                return `¥${cny}`
                                            }
                                            // USD for others
                                            return `$${standardPrices["美元价格"]}`
                                        })()}
                                    </span>
                                    {product.type === 'CONCIERGE' && calculating && (
                                        <span className="text-xs text-muted-foreground block animate-pulse">Calculating...</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {(product.description || product.descriptionZh || product.descriptionRu) && (
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-sm text-muted-foreground">
                                <span className="font-semibold text-white block mb-1">{dict.activity.description}:</span>
                                {language === 'zh' ? (product.descriptionZh || product.description) :
                                    language === 'ru' ? (product.descriptionRu || product.description) :
                                        product.description}
                            </div>
                        )}

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

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <h3 className="font-medium text-white flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        {dict.buy.contactDetails || "Contact Details"}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">{dict.buy.surname}</label>
                                            <Input
                                                placeholder="Wang"
                                                required
                                                value={surname}
                                                onChange={e => setSurname(e.target.value)}
                                                className="bg-secondary/20 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">{dict.buy.givenName}</label>
                                            <Input
                                                placeholder="Wei"
                                                required
                                                value={givenName}
                                                onChange={e => setGivenName(e.target.value)}
                                                className="bg-secondary/20 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                            <Phone className="w-4 h-4" />
                                            {dict.buy.phoneNumber}
                                        </label>
                                        <Input
                                            placeholder="+86 138 0000 0000"
                                            required
                                            value={phoneNumber}
                                            onChange={e => setPhoneNumber(e.target.value)}
                                            className="bg-secondary/20 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {product.type === 'CONCIERGE' && (
                            <div className="space-y-4">
                                {Array.isArray(product.conciergeFields) && product.conciergeFields.length > 0 ? (
                                    product.conciergeFields.map((field: any, idx: number) => (
                                        <div key={idx} className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                                {field.label || field.name}
                                                {field.required && <span className="text-red-500">*</span>}
                                            </label>
                                            <Input
                                                type={field.type || "text"}
                                                placeholder={field.placeholder || ""}
                                                required={field.required}
                                                value={dynamicFieldValues[field.name] || ""}
                                                onChange={e => setDynamicFieldValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                                                className="bg-secondary/20 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                            <LinkIcon className="w-4 h-4" />
                                            Target Link (Item to buy)
                                            <span className="text-red-500">*</span>
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

                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                        ₽ Ruble Amount
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 500"
                                        required
                                        value={rubleAmount}
                                        onChange={e => setRubleAmount(e.target.value)}
                                        className="bg-secondary/20 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20"
                                    />
                                </div>
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
                                            {product.city && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                                    <span>
                                                        {language === 'zh' ? (product.cityZh || product.city) :
                                                            language === 'ru' ? (product.cityRu || product.city) :
                                                                product.city}
                                                    </span>
                                                </>
                                            )}
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
                                            {product.city && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                                    <span>
                                                        {language === 'zh' ? (product.cityZh || product.city) :
                                                            language === 'ru' ? (product.cityRu || product.city) :
                                                                product.city}
                                                    </span>
                                                </>
                                            )}
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
                                    <span className="font-bold text-lg">${userBalance.toFixed(2)}</span>
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
                                disabled={loading || !canAfford || (product.type === 'CONCIERGE' && !calculatedPrice) || (product.type !== 'CONCIERGE' && isLoadingPrice)}
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
