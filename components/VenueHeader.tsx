"use client"

import { useLanguage } from "@/lib/i18n/LanguageContext"
import { VenueInfo } from "@/lib/data/venues"
import { MapPin } from "lucide-react"

export function VenueHeader({
    venueInfo,
    title,
    googleMap,
    yandexMap,
    description,
    descriptionZh,
    descriptionRu,
    titleZh,
    titleRu
}: {
    venueInfo?: VenueInfo,
    title: string,
    googleMap?: string,
    yandexMap?: string,
    description?: string,
    descriptionZh?: string,
    descriptionRu?: string,
    titleZh?: string,
    titleRu?: string
}) {
    const { language } = useLanguage()

    const dynamicDescription = (language === 'zh' ? descriptionZh : language === 'ru' ? descriptionRu : description) || description

    // Resolve dynamic title
    let displayTitle = title
    if (venueInfo) {
        displayTitle = venueInfo.names[language]
    }

    return (
        <div className="mb-8 p-8 glass-card relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                        {venueInfo ? venueInfo.names[language] : (
                            (language === 'zh' && titleZh)
                                ? titleZh
                                : (language === 'ru' && titleRu)
                                    ? titleRu
                                    : title
                        )}
                    </h1>
                    <div className="flex gap-3 flex-wrap">
                        {googleMap && (
                            <a href={googleMap} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium transition-colors border border-blue-500/20 hover:border-blue-500/30">
                                <MapPin className="w-4 h-4" /> Google Maps
                            </a>
                        )}
                        {yandexMap && (
                            <a href={yandexMap} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-lg text-sm font-medium transition-colors border border-red-500/20 hover:border-red-500/30">
                                <MapPin className="w-4 h-4" /> Yandex Maps
                            </a>
                        )}
                    </div>
                </div>

                <div className="prose prose-invert max-w-none">
                    {venueInfo ? (
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl">
                            {venueInfo.descriptions[language]}
                        </p>
                    ) : dynamicDescription ? (
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl whitespace-pre-wrap">
                            {dynamicDescription}
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
