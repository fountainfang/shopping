"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"
import { useLanguage } from "@/lib/i18n/LanguageContext"

export default function LoginPage() {
    const router = useRouter()
    const { dict } = useLanguage()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError("")

        const formData = new FormData(event.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                throw new Error("Invalid credentials")
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
        <div className="glass-card px-8 py-10 shadow-lg border-none bg-card relative">
            <div className="absolute top-4 left-4">
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    {dict.auth.backToHome}
                </Link>
            </div>

            <div className="flex flex-col space-y-2 text-center mb-6 mt-6">
                <h1 className="text-2xl font-semibold tracking-tight">{dict.auth.signInTitle}</h1>
                <p className="text-sm text-muted-foreground">
                    {dict.auth.subtitle}
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Input
                        id="email"
                        name="email"
                        placeholder={dict.auth.emailLabel}
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isLoading}
                        required
                    />
                    <Input
                        id="password"
                        name="password"
                        placeholder={dict.auth.passwordLabel}
                        type="password"
                        disabled={isLoading}
                        required
                    />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? dict.common.loading : dict.auth.signInBtn}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">{dict.auth.noAccount} </span>
                <Link href="/auth/register" className="underline hover:text-primary underline-offset-4">
                    {dict.auth.registerBtn}
                </Link>
            </div>
        </div>
    )
}
