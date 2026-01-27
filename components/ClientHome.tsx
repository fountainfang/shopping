"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { motion } from "framer-motion"
import { Landmark, Ticket, Tent, Anchor, TrainFront, Music2, Star, Sparkles } from "lucide-react"

interface VenueInfo { name: string, nameZh?: string, nameRu?: string }

interface DirectoryProps {
    session: any
    dynamicGroups: Record<string, VenueInfo[]>
    variant?: "landing" | "dashboard"
}

// Unified Card Component using Glassmorphism
function ServiceCard({ title, href, icon: Icon }: { title: string, href: string, icon: any }) {
    return (
        <Link href={href} className="group relative block w-full sm:min-w-[280px] max-w-[340px]">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <motion.div
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card relative h-full overflow-hidden p-6 sm:p-8 flex flex-col justify-between min-h-[160px]"
            >
                {/* Background Icon Decoration */}
                <div className="absolute -right-6 -top-6 text-white/5 transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                    <Icon className="w-32 h-32" />
                </div>

                <div className="relative z-10">
                    <div className="mb-4 inline-flex p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-inner backdrop-blur-md">
                        <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-primary-foreground transition-colors leading-tight">
                        {title}
                    </h3>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground group-hover:text-white/80">
                        V-Ticket
                    </span>
                    <Sparkles className="w-4 h-4 text-accent/80" />
                </div>
            </motion.div>
        </Link>
    )
}

export default function ClientHome({ session, dynamicGroups, variant = "landing" }: DirectoryProps) {
    const { dict, language } = useLanguage()

    const cities = Object.keys(dynamicGroups).sort()

    const Content = (
        <main className={`relative z-10 flex-grow space-y-20 ${variant === 'landing' ? 'container mx-auto px-4 md:px-8 py-16' : ''}`}>

            {/* Hero Text - Only for Landing */}
            {variant === 'landing' && (
                <div className="text-center space-y-6 mb-16 relative">
                    {/* Decorative Elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4">
                            {dict.home.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                            {dict.home.subtitle}
                        </p>
                    </motion.div>
                </div>
            )}

            {/* Dynamic Cities */}
            {cities.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
                    <p className="text-xl text-muted-foreground">No destinations available yet.</p>
                    <p className="text-sm text-muted-foreground/60 mt-2">Check back soon for new tickets!</p>
                </div>
            ) : (
                cities.map((city, idx) => {
                    const venues = dynamicGroups[city]
                    return (
                        <motion.section
                            key={city}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">
                                    {city === 'Moscow' ? dict.home.cities?.moscow || city :
                                        city === 'Saint Petersburg' ? dict.home.cities?.spb || city :
                                            city}
                                </h2>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center sm:place-items-stretch">
                                {venues.map(venueObj => {
                                    const displayName = (language === 'zh' ? venueObj.nameZh : language === 'ru' ? venueObj.nameRu : venueObj.name) || venueObj.name
                                    const isTheater = venueObj.name.toLowerCase().includes('theater') || venueObj.name.toLowerCase().includes('theatre') || venueObj.name.toLowerCase().includes('show')

                                    return (
                                        <ServiceCard
                                            key={venueObj.name}
                                            title={displayName}
                                            href={`/products?city=${encodeURIComponent(city)}&venue=${encodeURIComponent(venueObj.name)}&title=${encodeURIComponent(venueObj.name)}`}
                                            icon={isTheater ? Ticket : Landmark}
                                        />
                                    )
                                })}
                            </div>
                        </motion.section>
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
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent tracking-tight">
                        {dict.common.appName}
                    </h1>
                    <div className="flex gap-4 items-center">
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

            {/* Main Content: Directory */}
            {Content}
        </div>
    )
}
