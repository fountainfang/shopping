"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"

export default function AdminAttractionsPage() {
    const [attractions, setAttractions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/attractions")
            .then(res => res.json())
            .then(data => {
                setAttractions(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(err => setLoading(false))
    }, [])

    async function handleDelete(id: string) {
        if (!confirm("Are you sure? This might delete linked products or leave them orphaned.")) return

        const res = await fetch(`/api/attractions/${id}`, { method: "DELETE" })
        if (res.ok) {
            setAttractions(attractions.filter(a => a.id !== id))
        } else {
            alert("Failed to delete")
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Attractions</h1>
                <Link href="/admin/attractions/new">
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" /> Add Attraction
                    </Button>
                </Link>
            </div>

            <div className="border rounded-lg bg-card">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">City</th>
                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {attractions.map((attraction) => (
                            <tr key={attraction.id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-6 py-4 font-medium">{attraction.name}</td>
                                <td className="px-6 py-4">{attraction.city}</td>
                                <td className="px-6 py-4 text-muted-foreground">{new Date(attraction.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/admin/attractions/${attraction.id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-600"
                                            onClick={() => handleDelete(attraction.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {attractions.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                    No attractions found. Create one above.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
