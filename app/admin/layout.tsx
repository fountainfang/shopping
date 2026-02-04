import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Package, Users, Wallet, LogOut, ShoppingCart, Landmark } from "lucide-react"
import { SignOutButton } from "@/components/auth/SignOutButton"
import { SimpleLanguageSwitcher } from "@/components/SimpleLanguageSwitcher"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "admin") {
        redirect("/dashboard") // Redirect non-admins to user dashboard
    }

    return (
        <div className="min-h-screen bg-background flex" suppressHydrationWarning>
            <div role="complementary" className="w-64 border-r border-border bg-muted/10 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold font-mono text-primary">V-Ticket Admin</h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        Overview
                    </Link>
                    <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Package className="w-5 h-5" />
                        Products
                    </Link>
                    <Link href="/admin/attractions" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Landmark className="w-5 h-5" />
                        Attractions
                    </Link>
                    <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <ShoppingCart className="w-5 h-5" />
                        Orders
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Users className="w-5 h-5" />
                        Users
                    </Link>
                </nav>

                <div className="p-4 border-t border-border">
                    <SignOutButton />
                </div>
            </div>

            <main className="flex-1 overflow-auto bg-muted/5 flex flex-col">
                <header className="h-16 border-b border-border bg-background px-8 flex items-center justify-between sticky top-0 z-10">
                    <h2 className="text-lg font-medium text-muted-foreground">Console</h2>
                    <div className="flex items-center gap-4">
                        <SimpleLanguageSwitcher />
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
