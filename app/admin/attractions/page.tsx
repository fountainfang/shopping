"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react"

export default function AdminAttractionsPage() {
    const [attractions, setAttractions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [syncingMariinsky, setSyncingMariinsky] = useState(false)
    const [syncingBolshoi, setSyncingBolshoi] = useState(false)
    const [syncingMikhailovsky, setSyncingMikhailovsky] = useState(false)
    const [syncResult, setSyncResult] = useState<{ type: "success" | "error"; message: string } | null>(null)

    useEffect(() => {
        fetch("/api/attractions")
            .then(res => res.json())
            .then(data => {
                setAttractions(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(err => setLoading(false))
    }, [])

    const anySyncing = syncingMariinsky || syncingBolshoi || syncingMikhailovsky

    async function handleSync(endpoint: string, setSyncing: (v: boolean) => void) {
        setSyncing(true)
        setSyncResult(null)
        try {
            const res = await fetch(endpoint, { method: "POST" })
            const data = await res.json()
            if (res.ok) {
                setSyncResult({ type: "success", message: data.message || "Sync completed." })
            } else {
                setSyncResult({ type: "error", message: data.error || "Sync failed." })
            }
        } catch (err) {
            setSyncResult({ type: "error", message: String(err) })
        } finally {
            setSyncing(false)
        }
    }

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
                <div className="flex gap-2 flex-wrap justify-end">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleSync("/api/admin/sync-mariinsky", setSyncingMariinsky)}
                        disabled={anySyncing}
                    >
                        <RefreshCw className={`w-4 h-4 ${syncingMariinsky ? "animate-spin" : ""}`} />
                        {syncingMariinsky ? "Syncing…" : "Sync Mariinsky"}
                    </Button>
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleSync("/api/admin/sync-bolshoi", setSyncingBolshoi)}
                        disabled={anySyncing}
                    >
                        <RefreshCw className={`w-4 h-4 ${syncingBolshoi ? "animate-spin" : ""}`} />
                        {syncingBolshoi ? "Syncing…" : "Sync Bolshoi"}
                    </Button>
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleSync("/api/admin/sync-mikhailovsky", setSyncingMikhailovsky)}
                        disabled={anySyncing}
                    >
                        <RefreshCw className={`w-4 h-4 ${syncingMikhailovsky ? "animate-spin" : ""}`} />
                        {syncingMikhailovsky ? "Syncing…" : "Sync Mikhailovsky"}
                    </Button>
                    <Link href="/admin/attractions/new">
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" /> Add Attraction
                        </Button>
                    </Link>
                </div>
            </div>

            {syncResult && (
                <div className={`px-4 py-3 rounded-lg text-sm ${syncResult.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                    {syncResult.message}
                </div>
            )}

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
