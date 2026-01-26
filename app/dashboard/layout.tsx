import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { DashboardHeader } from "@/components/dashboard/Header"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/auth/login")
    }

    // Standardize user object to match SidebarProps
    const user = session.user ? {
        email: session.user.email,
        role: session.user.role
    } : undefined;

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar (Client Component) */}
            <Sidebar user={user} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <DashboardHeader />
                <div className="flex-1 p-6 md:p-10 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
