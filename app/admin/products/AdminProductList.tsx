"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash, ChevronLeft, ChevronRight } from "lucide-react"

export function AdminProductList({ products }: { products: any[] }) {
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState("ALL")
    const [page, setPage] = useState(1)
    const pageSize = 10

    // Filter Logic
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            (p.city || "").toLowerCase().includes(search.toLowerCase())
        const matchesType = typeFilter === "ALL" || p.type === typeFilter
        return matchesSearch && matchesType
    })

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / pageSize)
    const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize)

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex gap-4 items-center">
                <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="max-w-sm"
                />
                <Select value={typeFilter} onValueChange={(v: string) => { setTypeFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Types</SelectItem>
                        <SelectItem value="VIRTUAL">Virtual</SelectItem>
                        <SelectItem value="THEATER">Theater</SelectItem>
                        <SelectItem value="ATTRACTION">Attraction</SelectItem>
                        <SelectItem value="CONCIERGE">Concierge</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                            <th className="px-6 py-3 font-medium">Title</th>
                            <th className="px-6 py-3 font-medium">Type</th>
                            <th className="px-6 py-3 font-medium">City / Venue</th>
                            <th className="px-6 py-3 font-medium">Price</th>
                            <th className="px-6 py-3 font-medium">Stock</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {paginatedProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 font-medium max-w-[200px] truncate" title={product.title}>
                                    {product.title}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                        {product.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {product.city || product.location || "-"}
                                </td>
                                <td className="px-6 py-4">₽{product.price.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {product.stock}
                                    </span>
                                </td>
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
                {paginatedProducts.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        No products found.
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div>
                        Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredProducts.length)} of {filteredProducts.length} entries
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="flex items-center px-2">Page {page} of {totalPages}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
