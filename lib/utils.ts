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
