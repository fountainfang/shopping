import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Users, List, BarChart3, Settings } from "lucide-react"

export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Admin Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Products Card */}
                <Link href="/admin/products" className="group">
                    <div className="glass-card p-6 h-full transition-all hover:scale-[1.02] hover:shadow-lg hover:border-primary/50 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <ShoppingBag className="w-8 h-8" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Manage Products</h3>
                            <p className="text-muted-foreground text-sm">
                                Create, edit, refilling stock and delete digital products.
                            </p>
                        </div>
                        <div className="mt-4 flex items-center text-sm font-medium text-primary">
                            View Products <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                    </div>
                </Link>

                {/* Orders */}
                <Link href="/admin/orders" className="group">
                    <div className="glass-card p-6 h-full transition-all hover:scale-[1.02] hover:shadow-lg hover:border-primary/50 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-muted rounded-xl text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <List className="w-8 h-8" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Orders</h3>
                        <p className="text-muted-foreground text-sm">
                            View customer orders and transaction history.
                        </p>
                    </div>
                </Link>

                {/* Users - Placeholder */}
                <div className="glass-card p-6 h-full opacity-60">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-muted rounded-xl text-muted-foreground">
                            <Users className="w-8 h-8" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Users</h3>
                    <p className="text-muted-foreground text-sm">
                        Manage user accounts and balances.
                    </p>
                </div>
            </div>
        </div>
    )
}
