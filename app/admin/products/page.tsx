import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { AdminProductList } from "./AdminProductList"

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
    const [products, attractions] = await Promise.all([
        prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { orders: true } },
                attraction: { select: { id: true, name: true } }
            }
        }),
        prisma.attraction.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true }
        })
    ])

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

            <AdminProductList products={products} attractions={attractions} />
        </div>
    )
}

