"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { Globe } from "lucide-react"
import { cn } from "@/lib/utils"

export function SimpleLanguageSwitcher() {
    const { language, setLanguage } = useLanguage()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [ref])

    return (
        <div className="relative" ref={ref}>
            <Button variant="ghost" size="sm" className="gap-1.5 px-3" onClick={() => setOpen(!open)}>
                <Globe className="h-4 w-4" />
                <span className="font-medium text-xs">
                    {language === 'zh' ? "中文" : language === 'ru' ? "РУ" : "EN"}
                </span>
            </Button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-32 rounded-md border border-border bg-background text-foreground p-1 shadow-md z-[100]">
                    <button
                        onClick={() => { setLanguage('en'); setOpen(false); }}
                        className={cn("w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-muted/50 hover:text-foreground transition-colors", language === 'en' && "bg-muted font-medium")}
                    >
                        English
                    </button>
                    <button
                        onClick={() => { setLanguage('zh'); setOpen(false); }}
                        className={cn("w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-muted/50 hover:text-foreground transition-colors", language === 'zh' && "bg-muted font-medium")}
                    >
                        中文
                    </button>
                    <button
                        onClick={() => { setLanguage('ru'); setOpen(false); }}
                        className={cn("w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-muted/50 hover:text-foreground transition-colors", language === 'ru' && "bg-muted font-medium")}
                    >
                        Русский
                    </button>
                </div>
            )}
        </div>
    )
}
