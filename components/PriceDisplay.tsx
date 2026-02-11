"use client"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { useWorkerPrice } from "@/lib/hooks/useWorkerPrice"
import { Loader2 } from "lucide-react"

export function PriceDisplay({ amount, className }: { amount: number, className?: string }) {
    const { language } = useLanguage()
    const { prices, isLoading } = useWorkerPrice(amount)

    if (isLoading) {
        return <Loader2 className={`w-4 h-4 animate-spin ${className}`} />
    }

    if (!prices) {
        return <span className={className}>Error</span>
    }

    if (language === 'zh') {
        const cnyPrice = prices["不走淘宝价格"] || 0
        return <span className={className}>¥{cnyPrice.toFixed(0)}</span>
    }

    const usdPrice = prices["美元价格"] || 0
    return <span className={className}>${usdPrice.toFixed(2)}</span>
}
