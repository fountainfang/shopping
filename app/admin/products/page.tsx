import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash } from "lucide-react"
import Link from "next/link"

// Force dynamic rendering validation
export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { orders: true } } }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Products</h2>
                <div className="flex gap-2">
                    <Link href="/admin/products/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                            <th className="px-6 py-3 font-medium">Title</th>
                            <th className="px-6 py-3 font-medium">Price</th>
                            <th className="px-6 py-3 font-medium">Stock</th>
                            <th className="px-6 py-3 font-medium">Sales</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 font-medium">{product.title}</td>
                                <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{product._count.orders}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <Link href={`/admin/products/${product.id}/edit`}>
                                        <Button variant="ghost" size="icon">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                    <form action={`/api/products/${product.id}/delete`} method="POST" className="inline">
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        No products found.
                    </div>
                )}
            </div>
        </div>
    )
}
