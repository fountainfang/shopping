import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPrice(priceInRmb: number, language: string) {
    if (language === 'zh') {
        return `¥${priceInRmb.toFixed(2)}`;
    }
    // Default to USD conversion
    const usdPrice = priceInRmb / 6.8;
    return `$${usdPrice.toFixed(2)}`;
}

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount)
}

export function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date))
}

