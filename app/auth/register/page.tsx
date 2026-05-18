"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"
import { useLanguage } from "@/lib/i18n/LanguageContext"

export default function RegisterPage() {
    const router = useRouter()
    const { dict } = useLanguage()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    // Form State
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [wechatId, setWechatId] = useState("")
    const [telegramId, setTelegramId] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError("")

        if (!wechatId && !telegramId) {
            setError(dict.auth.contactRequired)
            setIsLoading(false)
            return
        }

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, wechatId, telegramId, phoneNumber }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to register")
            }

            // Automatically sign in after registration
            const signInResult = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (signInResult?.error) {
                throw new Error(signInResult.error)
            }

            router.push("/dashboard")
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="glass-card px-8 py-10 shadow-lg border-none bg-card max-w-md w-full mx-auto relative">
            <div className="absolute top-4 left-4">
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    {dict.auth.backToHome}
                </Link>
            </div>

            <div className="flex flex-col space-y-2 text-center mb-6 mt-6">
                <h1 className="text-2xl font-semibold tracking-tight">{dict.auth.registerTitle}</h1>
                <p className="text-sm text-muted-foreground">
                    {dict.auth.subtitle}
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Input
                        placeholder={dict.auth.emailLabel}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                    />

                    <Input
                        placeholder={dict.auth.wechatLabel}
                        value={wechatId}
                        onChange={(e) => setWechatId(e.target.value)}
                        disabled={isLoading}
                    />

                    <Input
                        placeholder={dict.auth.telegramLabel}
                        value={telegramId}
                        onChange={(e) => setTelegramId(e.target.value)}
                        disabled={isLoading}
                    />
                    
                    <p className="text-xs text-muted-foreground !mt-1">
                        * {dict.auth.contactRequired}
                    </p>

                    <Input
                        placeholder={dict.auth.phoneLabel}
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={isLoading}
                        required
                    />

                    <Input
                        placeholder={dict.auth.passwordLabel}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        required
                    />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? dict.auth.sending : dict.auth.registerBtn}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">{dict.auth.hasAccount} </span>
                <Link href="/auth/login" className="underline hover:text-primary underline-offset-4">
                    {dict.auth.signInBtn}
                </Link>
            </div>
        </div>
    )
}
