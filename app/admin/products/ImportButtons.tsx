"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function ImportButtons() {
    const router = useRouter()
    const [loadingBolshoi, setLoadingBolshoi] = useState(false)
    const [loadingMariinsky, setLoadingMariinsky] = useState(false)

    async function handleImport(source: 'bolshoi' | 'mariinsky') {
        const setLoading = source === 'bolshoi' ? setLoadingBolshoi : setLoadingMariinsky
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/import/${source}`, { method: 'POST' })
            const data = await res.json()
            if (res.ok) {
                alert(`Imported ${data.count} tickets from ${source === 'bolshoi' ? 'Bolshoi' : 'Mariinsky'}!`)
                router.refresh()
            } else {
                alert(`Error: ${data.error}`)
            }
        } catch (e) {
            alert('Import failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleImport('bolshoi')}
                disabled={loadingBolshoi || loadingMariinsky}
            >
                {loadingBolshoi ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                Import Bolshoi
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleImport('mariinsky')}
                disabled={loadingBolshoi || loadingMariinsky}
            >
                {loadingMariinsky ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                Import Mariinsky
            </Button>
        </div>
    )
}
