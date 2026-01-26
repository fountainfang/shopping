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

    // Resolve dynamic title if provided, otherwise fallback to standard title
    // But wait, `title` prop coming in is just a string. 
    // If we have venueInfo, we already use `venueInfo.names[language]`?
    // Let's check below.

    let displayTitle = title
    if (venueInfo) {
        displayTitle = venueInfo.names[language]
    } else {
        // If no venueInfo (e.g. generic product), we need multilingual titles passed in
        // We will add titleZh and titleRu to props
        // displayTitle = (language === 'zh' ? titleZh : language === 'ru' ? titleRu : title) || title
    }

    return (
        <div className="mb-8 p-6 bg-teal-800/40 rounded-xl border border-teal-700/50 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                        {venueInfo ? venueInfo.names[language] : (
                            (language === 'zh' && titleZh)
                                ? titleZh
                                : (language === 'ru' && titleRu)
                                    ? titleRu
                                    : title
                        )}
                    </h1>
                    <div className="flex gap-3">
                        {googleMap && (
                            <a href={googleMap} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-lg text-sm transition-colors border border-blue-500/30">
                                <MapPin className="w-4 h-4" /> Google Maps
                            </a>
                        )}
                        {yandexMap && (
                            <a href={yandexMap} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg text-sm transition-colors border border-red-500/30">
                                <MapPin className="w-4 h-4" /> Yandex Maps
                            </a>
                        )}
                    </div>
                </div>

                {venueInfo ? (
                    <p className="text-lg text-teal-100 leading-relaxed max-w-4xl">
                        {venueInfo.descriptions[language]}
                    </p>
                ) : dynamicDescription ? (
                    <p className="text-lg text-teal-100 leading-relaxed max-w-4xl whitespace-pre-wrap">
                        {dynamicDescription}
                    </p>
                ) : null}
            </div>
        </div>
    )
}
