import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ShoppingBag, Tag, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function getProducts() {
    return await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    })
}

export default async function ShopPage() {
    const session = await getServerSession(authOptions)

    // Fetch products
    // Note: If DB is empty, we might want to seed or show empty state.
    let products: any[] = [];
    try {
        products = await getProducts();
    } catch (e) {
        console.error("Failed to fetch products", e);
    }

    // To display user balance context, we might want to fetch user again or rely on client-side context (not implemented yet).
    // For now, simple list.

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
                <div className="p-2 bg-muted rounded-full px-4 text-sm text-muted-foreground flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span className="font-medium text-foreground">{products.length}</span> Items Available
                </div>
            </div>

            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl bg-muted/20">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-medium">No products found</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm text-center">
                        The marketplace is currently empty. Check back later!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="glass-card flex flex-col overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl">
                            <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
                                <ShoppingBag className="w-16 h-16 text-foreground/20" />
                                {/* Badge for stock */}
                                {product.stock <= 0 && (
                                    <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
                                        SOLD OUT
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                                    {product.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                                    <div className="text-2xl font-bold text-primary">
                                        ${product.price.toFixed(2)}
                                    </div>

                                    <Link href={`/buy/${product.id}`} className={product.stock <= 0 ? "pointer-events-none" : ""}>
                                        <Button disabled={product.stock <= 0} className="gap-2">
                                            {product.stock > 0 ? "Buy Now" : "Out of Stock"}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
