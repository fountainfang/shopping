import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SettingsView } from "@/components/dashboard/SettingsView"

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/auth/login")
    }

    return <SettingsView user={session.user} />
}
