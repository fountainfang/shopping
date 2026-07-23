"use client"

import { useEffect, useRef } from "react"
import { useLanguage } from "@/lib/i18n/LanguageContext"

export default function TransfersWidget() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { language } = useLanguage()

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous widget content to avoid duplication
    containerRef.current.innerHTML = ""

    const script = document.createElement("script")
    script.async = true
    script.setAttribute("charset", "utf-8")

    // Map language and display currency dynamically
    const langVal = language === "zh" ? "zh" : language === "ru" ? "ru" : "en"
    const currencyVal = language === "zh" ? "CNY" : language === "ru" ? "RUB" : "USD"

    // Construct the script URL using the user's configuration and dynamic properties
    script.src = `https://tpwidg.com/content?trs=551723&powered_by=true&shmarker=752420&language=${langVal}&display_currency=${currencyVal}&transfer_type=any&theme=biletik&hide_form_extras=true&hide_external_links=true&disable_currency_selector=true&campaign_id=1&promo_id=691`

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
