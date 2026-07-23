"use client"

import { useEffect, useRef } from "react"
import { useLanguage } from "@/lib/i18n/LanguageContext"

export default function FlightsWidget() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { language } = useLanguage()

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous widget content to avoid duplication
    containerRef.current.innerHTML = ""

    const script = document.createElement("script")
    script.async = true
    script.setAttribute("charset", "utf-8")

    // Map current locale dynamically
    const localeVal = language === "zh" ? "zh" : language === "ru" ? "ru" : "en"

    // Construct the script URL using the user's configuration and dynamic locale
    script.src = `https://tpwidg.com/content?currency=usd&trs=551723&shmarker=752420&show_hotels=true&powered_by=true&locale=${localeVal}&searchUrl=www.aviasales.com%2Fsearch&primary_override=%2332a8dd&color_button=%2332a8dd&color_icons=%2332a8dd&dark=%23262626&light=%23FFFFFF&secondary=%23FFFFFF&special=%23C4C4C4&color_focused=%2332a8dd&border_radius=0&plain=false&promo_id=7879&campaign_id=100`

    containerRef.current.appendChild(script)
  }, [language])

  return (
    <div className="w-full flex justify-center">
      <div 
        ref={containerRef} 
        className="w-full min-h-[300px] overflow-hidden rounded-2xl bg-white/5 border border-white/5 shadow-2xl" 
      />
    </div>
  )
}
