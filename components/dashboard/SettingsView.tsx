"use client"

import { useLanguage } from "@/lib/i18n/LanguageContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Shield, Bell, Globe } from "lucide-react"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

interface SettingsViewProps {
    user: {
        name?: string | null
        email?: string | null
        role?: string | null
    }
}

export function SettingsView({ user }: SettingsViewProps) {
    const { dict } = useLanguage()

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h3 className="text-3xl font-bold tracking-tight">{dict.settings.title}</h3>
                <p className="text-muted-foreground">
                    {dict.settings.subtitle}
                </p>
            </div>

            <Separator className="my-6" />

            {/* Profile Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-teal-500" />
                    <h4 className="text-xl font-semibold">{dict.settings.profile}</h4>
                </div>

                <div className="glass-card p-6 space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">{dict.settings.email}</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                defaultValue={user.email || ""}
                                disabled
                                className="pl-9 bg-muted/50"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Preferences Section */}
            <div className="space-y-6 pt-6">
                <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-teal-500" />
                    <h4 className="text-xl font-semibold">{dict.settings.preferences}</h4>
                </div>

                <div className="glass-card p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">{dict.settings.language}</Label>
                            <p className="text-sm text-muted-foreground">
                                {dict.settings.languageDesc}
                            </p>
                        </div>
                        <LanguageSwitcher />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between opacity-60">
                        <div className="space-y-0.5">
                            <Label className="text-base">{dict.settings.notifications}</Label>
                            <p className="text-sm text-muted-foreground">
                                {dict.settings.notificationsDesc}
                            </p>
                        </div>
                        <Button variant="outline" disabled size="sm">
                            <Bell className="w-4 h-4 mr-2" />
                            {dict.settings.configure}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
