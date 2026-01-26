"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionaries, Dictionary, Language } from './dictionaries';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    dict: Dictionary;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && ['en', 'zh', 'ru'].includes(savedLang)) {
            setLanguageState(savedLang);
        }
        setMounted(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    if (!mounted) {
        // Prevent hydration mismatch by rendering nothing or a loader until mounted
        // or just render default (en) but know it might flicker.
        // For simplicity, we render children with default 'en' state initially
        // but the useEffect will update it quickly.
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, dict: dictionaries[language] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
