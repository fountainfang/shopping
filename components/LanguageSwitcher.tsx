"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { Globe } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage()

    const languages = {
        en: "English",
        zh: "中文",
        ru: "Русский"
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9">
                    <Globe className="h-4 w-4" />
                    <span className="sr-only">Switch Language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-muted' : ''}>
                    English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('zh')} className={language === 'zh' ? 'bg-muted' : ''}>
                    中文
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ru')} className={language === 'ru' ? 'bg-muted' : ''}>
                    Русский
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
