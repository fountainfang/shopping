"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useLanguage } from "@/lib/i18n/LanguageContext"

type ProductOption = {
    id: string;
    title: string;
    titleZh: string | null;
    titleRu: string | null;
}

export function ProductFilter({ products }: { products: ProductOption[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { language } = useLanguage()

    const selectedProductId = searchParams.get('productId') || ""

    const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        const params = new URLSearchParams(searchParams.toString())
        if (val) {
            params.set('productId', val)
        } else {
            params.delete('productId')
        }
        const queryString = params.toString()
        router.push(queryString ? `${pathname}?${queryString}` : pathname)
    }

    const label = language === 'zh' ? '按项目筛选:' : language === 'ru' ? 'Фильтр по продукту:' : 'Filter by Product:'
    const allLabel = language === 'zh' ? '— 全部项目 —' : language === 'ru' ? '— Все продукты —' : '— All Products —'

    return (
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
            <span className="text-sm text-slate-400 font-medium whitespace-nowrap px-2">
                {label}
            </span>
            <select
                value={selectedProductId}
                onChange={handleProductChange}
                className="h-9 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary min-w-[200px]"
            >
                <option value="">{allLabel}</option>
                {products.map(p => {
                    const title = language === 'zh' && p.titleZh ? p.titleZh : language === 'ru' && p.titleRu ? p.titleRu : p.title;
                    return (
                        <option key={p.id} value={p.id}>
                            {title}
                        </option>
                    )
                })}
            </select>
        </div>
    )
}
