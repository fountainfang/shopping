"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"

export default function NewAttractionPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [closedDays, setClosedDays] = useState<number[]>([])
    const [formData, setFormData] = useState({
        name: "",
        nameZh: "",
        nameRu: "",
        description: "",
        descriptionZh: "",
        descriptionRu: "",
        city: "Moscow",
        cityZh: "莫斯科",
        cityRu: "Москва",
        image: "",
        googleMapLink: "",
        yandexMapLink: "",
        bookingWindow: "10",
        slotInterval: "60",
        startTime: "09:00",
        endTime: "18:00"
    })

    const weekdays = [
        { label: "Monday", value: 1 },
        { label: "Tuesday", value: 2 },
        { label: "Wednesday", value: 3 },
        { label: "Thursday", value: 4 },
        { label: "Friday", value: 5 },
        { label: "Saturday", value: 6 },
        { label: "Sunday", value: 0 }
    ]

    const handleCheckboxChange = (value: number) => {
        if (closedDays.includes(value)) {
            setClosedDays(closedDays.filter(v => v !== value))
        } else {
            setClosedDays([...closedDays, value])
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                ...formData,
                bookingWindow: formData.bookingWindow ? Number(formData.bookingWindow) : null,
                slotInterval: formData.slotInterval ? Number(formData.slotInterval) : null,
                closedDays
            }

            const res = await fetch("/api/attractions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error("Failed to create")

            router.push("/admin/attractions")
        } catch (err) {
            console.error(err)
            alert("Error creating attraction")
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/attractions">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">New Attraction</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-card p-6 rounded-lg border">

                {/* General Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">General Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name (English)</label>
                            <Input name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Bolshoi Theatre" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name (Chinese)</label>
                            <Input name="nameZh" value={formData.nameZh} onChange={handleChange} placeholder="e.g. 莫斯科大剧院" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name (Russian)</label>
                            <Input name="nameRu" value={formData.nameRu} onChange={handleChange} placeholder="e.g. Большой театр" />
                        </div>
                    </div>
                </div>

                {/* Location Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">City (English)</label>
                            <Input name="city" required value={formData.city} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">City (Chinese)</label>
                            <Input name="cityZh" value={formData.cityZh} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">City (Russian)</label>
                            <Input name="cityRu" value={formData.cityRu} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* Booking & Slot Policies */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Booking & Slot Policies</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Booking Window (Days)</label>
                            <Input 
                                type="number" 
                                name="bookingWindow" 
                                required 
                                min={1} 
                                value={formData.bookingWindow} 
                                onChange={handleChange} 
                                placeholder="e.g. 10" 
                            />
                            <p className="text-xs text-muted-foreground">Days in advance to sell tickets.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Slot Interval (Minutes)</label>
                            <Input 
                                type="number" 
                                name="slotInterval" 
                                required 
                                min={5} 
                                value={formData.slotInterval} 
                                onChange={handleChange} 
                                placeholder="e.g. 60" 
                            />
                            <p className="text-xs text-muted-foreground">Interval between entry slots.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Time</label>
                            <Input 
                                type="time" 
                                name="startTime" 
                                required 
                                value={formData.startTime} 
                                onChange={handleChange} 
                            />
                            <p className="text-xs text-muted-foreground">Opening slot time.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Time</label>
                            <Input 
                                type="time" 
                                name="endTime" 
                                required 
                                value={formData.endTime} 
                                onChange={handleChange} 
                            />
                            <p className="text-xs text-muted-foreground">Closing slot time.</p>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <label className="text-sm font-medium block">Weekly Closed Days (Rest Days)</label>
                        <div className="flex flex-wrap gap-4 pt-1">
                            {weekdays.map(day => {
                                const isChecked = closedDays.includes(day.value);
                                return (
                                    <label key={day.value} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleCheckboxChange(day.value)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-background"
                                        />
                                        <span>{day.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground">Select weekdays when the attraction is closed.</p>
                    </div>
                </div>

                {/* Descriptions */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Descriptions</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description (English)</label>
                            <Textarea name="description" rows={3} value={formData.description} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description (Chinese)</label>
                            <Textarea name="descriptionZh" rows={3} value={formData.descriptionZh} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description (Russian)</label>
                            <Textarea name="descriptionRu" rows={3} value={formData.descriptionRu} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* Map Links */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Google Map Link</label>
                            <Input name="googleMapLink" value={formData.googleMapLink} onChange={handleChange} placeholder="https://maps.google.com/..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Yandex Map Link</label>
                            <Input name="yandexMapLink" value={formData.yandexMapLink} onChange={handleChange} placeholder="https://yandex.ru/maps/..." />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button type="submit" size="lg" disabled={loading} className="w-full md:w-auto">
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Creating..." : "Create Attraction"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
