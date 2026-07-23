"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { motion } from "framer-motion"
import FlightsWidget from "@/components/FlightsWidget"
import TransfersWidget from "@/components/TransfersWidget"

interface ClientFlightsPageProps {
    session: any
}

export default function ClientFlightsPage({ session }: ClientFlightsPageProps) {
    const { dict } = useLanguage()
    const [activeTab, setActiveTab] = useState<"flights" | "transfers">("flights")

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-white overflow-x-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[150px]" />
                <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[180px]" />
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-white/5">
                <div className="container flex h-20 items-center justify-between px-4 md:px-8 mx-auto">
                    <Link href="/">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent tracking-tight cursor-pointer">
                            {dict.common.appName}
                        </h1>
                    </Link>
                    <div className="flex gap-4 items-center">
                        <Link href="/flights">
                            <span className="text-sm font-semibold text-primary-foreground hover:text-white transition-colors cursor-pointer border-b-2 border-primary-foreground pb-1">
                                {dict.common.flights}
                            </span>
                        </Link>
                        <LanguageSwitcher />
                        {session ? (
                            <div className="flex gap-2 sm:gap-4">
                                {session?.user?.role === 'admin' && (
                                    <Link href="/admin">
                                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white hover:bg-white/5">{dict.common.adminPanel}</Button>
                                    </Link>
                                )}
                                <Link href="/dashboard">
                                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">{dict.common.dashboard}</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white hover:bg-white/5 transition-colors">{dict.common.login}</Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button size="sm" className="bg-white text-black hover:bg-white/90 shadow-lg shadow-white/5 font-semibold transition-all">
                                        {dict.common.register}
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 flex-grow container mx-auto px-4 md:px-8 py-16">
                <div className="text-center space-y-6 mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
                            {activeTab === "flights" ? dict.common.flights : dict.common.transfers}
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                            {dict.home.subtitle}
                        </p>
                    </motion.div>
                </div>

                {/* Tab Switcher */}
                <div className="max-w-5xl mx-auto flex justify-center mb-8">
                    <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab("flights")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                activeTab === "flights"
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:text-white"
                            }`}
                        >
                            {dict.common.flights}
                        </button>
                        <button
                            onClick={() => setActiveTab("transfers")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                activeTab === "transfers"
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:text-white"
                            }`}
                        >
                            {dict.common.transfers}
                        </button>
                    </div>
                </div>

                {/* Flights / Transfers Search Widget Container */}
                <div className="max-w-5xl mx-auto p-4 md:p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-3xl relative overflow-hidden">
                    <div className="absolute -left-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-[60px] pointer-events-none" />
                    
                    {activeTab === "flights" ? <FlightsWidget /> : <TransfersWidget />}
                </div>
            </main>
        </div>
    )
}
