"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { motion } from "framer-motion"
import { Landmark, Ticket, Tent, Anchor, TrainFront, Music2, Star } from "lucide-react"

interface VenueInfo { name: string, nameZh?: string, nameRu?: string }

interface DirectoryProps {
    session: any
    dynamicGroups: Record<string, VenueInfo[]>
    variant?: "landing" | "dashboard"
}
// ... existing ServiceCard ...
function ServiceCard({ title, href, icon: Icon, colorClass = "from-teal-600 to-teal-800" }: { title: string, href: string, icon: any, colorClass?: string }) {
    return (
        <Link href={href} className="flex-1 min-w-[200px] max-w-[300px]">
            <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative overflow-hidden group rounded-xl bg-gradient-to-br ${colorClass} p-6 shadow-lg border border-white/10 h-full`}
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icon className="w-24 h-24" />
                </div>

                <div className="relative z-10 flex flex-col h-full justify-between space-y-4">
                    <div className="p-3 bg-white/10 w-fit rounded-lg backdrop-blur-sm">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
                </div>
            </motion.div>
        </Link>
    )
}

export default function ClientHome({ session, dynamicGroups, variant = "landing" }: DirectoryProps) {
    const { dict, language } = useLanguage()

    // Helper to get theme by city name (loose matching)
    const getTheme = (city: string) => {
        const c = city.toLowerCase()
        if (c.includes('moscow') || c.includes('moskva')) return {
            color: "from-blue-600 to-indigo-900",
            titleGradient: "from-blue-400 to-blue-200",
            iconColor: "text-blue-400"
        }
        if (c.includes('petersburg') || c.includes('spb')) return {
            color: "from-emerald-600 to-teal-900",
            titleGradient: "from-emerald-400 to-cyan-200",
            iconColor: "text-emerald-400"
        }
        return {
            color: "from-slate-600 to-slate-900",
            titleGradient: "from-slate-400 to-slate-200",
            iconColor: "text-slate-400"
        }
    }

    // Merge static known venues with dynamic ones if needed, or just use dynamic if we want to be fully data-driven.
    // User wants "Show submitted products". 
    // Ideally we iterate `dynamicGroups`.
    // However, `dynamicGroups` keys are the `city` string from DB (e.g. "Moscow").

    // Let's iterate the keys of dynamicGroups.
    const cities = Object.keys(dynamicGroups).sort()

    const Content = (
        <main className={`relative z-10 flex-grow space-y-16 ${variant === 'landing' ? 'container mx-auto px-4 md:px-8 py-12' : ''}`}>

            {/* Hero Text - Only for Landing */}
            {variant === 'landing' && (
                <div className="text-left space-y-2 mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        {dict.home.title}
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl">{dict.home.subtitle}</p>
                </div>
            )}

            {/* Dynamic Cities */}
            {cities.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-700/50 rounded-xl">
                    <p className="text-xl text-slate-400">No destinations available yet.</p>
                    <p className="text-sm text-slate-500 mt-2">Check back soon for new tickets!</p>
                </div>
            ) : (
                cities.map(city => {
                    const theme = getTheme(city)
                    const venues = dynamicGroups[city]

                    return (
                        <section key={city}>
                            <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                                <Landmark className={`w-8 h-8 ${theme.iconColor}`} />
                                <h2 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${theme.titleGradient}`}>
                                    {/* Try to use dictionary if matches known key, else raw */}
                                    {city === 'Moscow' ? dict.home.cities.moscow :
                                        city === 'Saint Petersburg' ? dict.home.cities.spb :
                                            city}
                                </h2>
                            </div>
                            <div className="flex flex-wrap gap-6">
                                {venues.map(venueObj => {
                                    // Resolve display Name
                                    const displayName = (language === 'zh' ? venueObj.nameZh : language === 'ru' ? venueObj.nameRu : venueObj.name) || venueObj.name

                                    return (
                                        <ServiceCard
                                            key={venueObj.name}
                                            title={displayName}
                                            // Link filters by the English/Primary name (venueObj.name)
                                            href={`/products?city=${encodeURIComponent(city)}&venue=${encodeURIComponent(venueObj.name)}&title=${encodeURIComponent(venueObj.name)}`}
                                            icon={venueObj.name.toLowerCase().includes('theater') || venueObj.name.toLowerCase().includes('theatre') || venueObj.name.toLowerCase().includes('show') ? Ticket : Landmark}
                                            colorClass={theme.color}
                                        />
                                    )
                                })}
                            </div>
                        </section>
                    )
                })
            )}
        </main>
    )

    if (variant === 'dashboard') {
        return (
            <div className="w-full">
                {Content}
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#0f172a] text-white font-sans selection:bg-teal-500 selection:text-white">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-600/20 rounded-full blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5">
                <div className="container flex h-16 items-center justify-between px-4 md:px-8 mx-auto">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
                        {dict.common.appName}
                    </h1>
                    <div className="flex gap-4 items-center">
                        <LanguageSwitcher />
                        {session ? (
                            <div className="flex gap-2 sm:gap-4">
                                {session?.user?.role === 'admin' && (
                                    <Link href="/admin">
                                        <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300 hover:bg-white/5">{dict.common.adminPanel}</Button>
                                    </Link>
                                )}
                                <Link href="/dashboard">
                                    <Button size="sm" className="bg-teal-600 hover:bg-teal-500 text-white">{dict.common.dashboard}</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm" className="text-white hover:text-teal-300 hover:bg-white/5">{dict.common.login}</Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button size="sm" className="bg-teal-600 hover:bg-teal-500 text-white border-none shadow-lg shadow-teal-900/20">{dict.common.register}</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content: Directory */}
            {Content}
        </div>
    )
}
