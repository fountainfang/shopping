"use client";

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { Check, ChevronsUpDown } from "lucide-react"

type CityData = {
    en: string
    zh: string
    ru: string
}

type AttractionSimple = { id: string, name: string, city: string }

export default function EditProductClient({ product, existingCities, attractions = [] }: { product: any, existingCities: CityData[], attractions?: AttractionSimple[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // City Autocomplete State
    const [openCity, setOpenCity] = useState(false)

    // Valid types
    const [type, setType] = useState(product.type || "VIRTUAL")

    // Form State
    const [formData, setFormData] = useState({
        title: product.title || "",
        description: product.description || "",
        city: product.city || "",
        titleZh: product.titleZh || "",
        descriptionZh: product.descriptionZh || "",
        cityZh: product.cityZh || "",
        titleRu: product.titleRu || "",
        descriptionRu: product.descriptionRu || "",
        cityRu: product.cityRu || "",
        price: product.price || 0,
        stock: product.stock || 0,
        content: product.content || "",
        location: product.location || "",
        venue: product.venue || "",
        googleMapLink: product.googleMapLink || "",
        yandexMapLink: product.yandexMapLink || "",
        attractionId: product.attractionId || ""
    })

    const handleCitySelect = (cityData: CityData) => {
        setFormData(prev => ({
            ...prev,
            city: cityData.en,
            cityZh: cityData.zh || prev.cityZh,
            cityRu: cityData.ru || prev.cityRu
        }))
        setOpenCity(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        if (name === 'attractionId' && value) {
            const attr = attractions?.find(a => a.id === value)
            if (attr) {
                setFormData(prev => ({
                    ...prev,
                    city: attr.city,
                    attractionId: value,
                    location: attr.name
                }))
            }
        }
    }

    // Slot Generator State
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0])
    const [weekdays, setWeekdays] = useState<boolean[]>([true, true, true, true, true, true, true]) // Sun-Sat
    const [startTime, setStartTime] = useState("09:00")
    const [endTime, setEndTime] = useState("17:00")
    const [interval, setInterval] = useState(60)
    const [generatedSlots, setGeneratedSlots] = useState(Array.isArray(product.availableSlots) ? product.availableSlots.join('\n') : "")

    function generateSlots() {
        if (!startDate || !endDate || !startTime || !endTime || !interval) return;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        let currentDay = new Date(start);
        let slots: string[] = [];

        while (currentDay <= end) {
            // Check if weekday is selected (0=Sun, 6=Sat)
            if (weekdays[currentDay.getDay()]) {
                let slotTime = new Date(currentDay);
                slotTime.setHours(startH, startM, 0, 0);

                let dayEndTime = new Date(currentDay);
                dayEndTime.setHours(endH, endM, 0, 0);

                while (slotTime < dayEndTime) {
                    // Format: YYYY-MM-DD HH:mm
                    const dateStr = slotTime.toISOString().split('T')[0];
                    const timeStr = slotTime.toTimeString().slice(0, 5);
                    slots.push(`${dateStr} ${timeStr}`);

                    // Add interval
                    slotTime.setMinutes(slotTime.getMinutes() + Number(interval));
                }
            }
            // Next day
            currentDay.setDate(currentDay.getDate() + 1);
        }

        setGeneratedSlots(slots.join('\n'));
    }

    const toggleWeekday = (index: number) => {
        const newWeekdays = [...weekdays];
        newWeekdays[index] = !newWeekdays[index];
        setWeekdays(newWeekdays);
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const submitData: any = {
            ...formData,
            type, // from separate state
            price: parseFloat(String(formData.price)),
            stock: parseInt(String(formData.stock)),
        }

        // Handle Available Slots for Attraction
        if (type === "ATTRACTION") {
            if (generatedSlots) {
                // split by new lines
                submitData.availableSlots = generatedSlots.split('\n').map((s: string) => s.trim()).filter(Boolean);
            }
        }

        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submitData)
            });

            if (!res.ok) throw new Error("Failed");
            router.push("/admin/products");
            router.refresh();
        } catch (e) {
            console.error(e);
            alert("Error updating product");
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
            <form onSubmit={onSubmit} className="space-y-6 glass-card p-8">

                <div className="space-y-2">
                    <label className="text-sm font-medium">Product Type</label>
                    <div className="grid grid-cols-2 gap-4">
                        <select
                            name="type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="VIRTUAL">Virtual Product (Standard)</option>
                            <option value="ATTRACTION">Attraction Ticket (景点门票)</option>
                            <option value="THEATER">Theater Ticket (剧院门票)</option>
                            <option value="CONCIERGE">Concierge Service (代买服务)</option>
                        </select>

                        {/* Attraction Selection */}
                        <div className="space-y-1">
                            <select
                                name="attractionId"
                                value={formData.attractionId}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground"
                            >
                                <option value="">-- No Attraction (Independent) --</option>
                                {attractions?.map(a => (
                                    <option key={a.id} value={a.id}>{a.name} ({a.city})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Multilingual Tabs */}
                <Tabs defaultValue="en" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="en">English</TabsTrigger>
                        <TabsTrigger value="zh">中文</TabsTrigger>
                        <TabsTrigger value="ru">Русский</TabsTrigger>
                    </TabsList>

                    {/* English */}
                    <TabsContent value="en" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title (EN)</label>
                            <Input name="title" value={formData.title} onChange={handleChange} required placeholder="Product Title" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description (EN)</label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                placeholder="Description"
                            />
                        </div>
                        <div className="space-y-2 relative">
                            <label className="text-sm font-medium flex justify-between">
                                City (EN)
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={() => setOpenCity(!openCity)}
                                >
                                    {openCity ? "Close List" : "Select Existing"}
                                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                </Button>
                            </label>

                            {/* Autocomplete Dropdown */}
                            {openCity && (
                                <div className="absolute z-50 mt-1 w-[200px] bg-background border rounded-md shadow-lg p-2 space-y-2">
                                    <Input
                                        placeholder="Search city..."
                                        className="h-8 text-xs"
                                        autoFocus
                                        onChange={(e) => {
                                            // Simple client-side filter could go here if list is long, 
                                            // but for now relying on native scrolling or just showing all.
                                        }}
                                    />
                                    <div className="max-h-[200px] overflow-y-auto space-y-1">
                                        {existingCities.map((city) => (
                                            <div
                                                key={city.en}
                                                className={`text-sm px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center ${formData.city === city.en ? "bg-accent/50" : ""}`}
                                                onClick={() => handleCitySelect(city)}
                                            >
                                                <Check
                                                    className={`mr-2 h-3 w-3 ${formData.city === city.en ? "opacity-100" : "opacity-0"}`}
                                                />
                                                {city.en}
                                            </div>
                                        ))}
                                        {existingCities.length === 0 && <div className="text-xs text-muted-foreground p-2 text-center">No cities found</div>}
                                    </div>
                                </div>
                            )}

                            <Input name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Moscow" />
                        </div>
                    </TabsContent>

                    {/* Chinese */}
                    <TabsContent value="zh" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">标题 (中文)</label>
                            <Input name="titleZh" value={formData.titleZh} onChange={handleChange} placeholder="产品标题" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">介绍 (中文)</label>
                            <Textarea
                                name="descriptionZh"
                                value={formData.descriptionZh}
                                onChange={handleChange}
                                placeholder="产品详情"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">城市 (中文)</label>
                            <Input name="cityZh" value={formData.cityZh} onChange={handleChange} placeholder="例如: 莫斯科" />
                        </div>
                    </TabsContent>

                    {/* Russian */}
                    <TabsContent value="ru" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Название (RU)</label>
                            <Input name="titleRu" value={formData.titleRu} onChange={handleChange} placeholder="Название товара" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Описание (RU)</label>
                            <Textarea
                                name="descriptionRu"
                                value={formData.descriptionRu}
                                onChange={handleChange}
                                placeholder="Описание товара"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Город (RU)</label>
                            <Input name="cityRu" value={formData.cityRu} onChange={handleChange} placeholder="Например: Москва" />
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Maps */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Google Maps Link</label>
                        <Input name="googleMapLink" value={formData.googleMapLink} onChange={handleChange} placeholder="https://maps.google.com/..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Yandex Maps Link</label>
                        <Input name="yandexMapLink" value={formData.yandexMapLink} onChange={handleChange} placeholder="https://yandex.ru/maps/..." />
                    </div>
                </div>

                {/* Conditional Fields */}
                {(type === 'ATTRACTION' || type === 'THEATER') && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Location / Address</label>
                        <Input name="location" value={formData.location} onChange={handleChange} placeholder={type === 'THEATER' ? "Theater Name" : "Attraction Address"} />
                    </div>
                )}

                {type === 'THEATER' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Venue / Hall</label>
                        <Input name="venue" value={formData.venue} onChange={handleChange} placeholder="Hall 1, IMAX Room..." />
                    </div>
                )}

                {type === 'ATTRACTION' && (
                    <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                        <h3 className="font-semibold text-sm">Slot Generator</h3>
                        {/* Days Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium">Active Days</label>
                            <div className="flex gap-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleWeekday(i)}
                                        className={`px-2 py-1 text-xs rounded border ${weekdays[i] ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Start Time</label>
                                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium">End Time</label>
                                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Interval (min)</label>
                                <Input type="number" value={interval} onChange={(e) => setInterval(Number(e.target.value))} />
                            </div>
                        </div>

                        <Button type="button" variant="outline" size="sm" onClick={generateSlots} className="w-full">
                            Generate Slots
                        </Button>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Generated Slots (Editable)</label>
                            <Textarea
                                name="availableSlots"
                                value={generatedSlots}
                                onChange={(e) => setGeneratedSlots(e.target.value)}
                                className="font-mono min-h-[150px]"
                                placeholder="Generated slots will appear here..."
                            />
                            <p className="text-xs text-muted-foreground">Verify and remove any specific dates if closed.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Price ($)</label>
                        <Input name="price" value={formData.price} onChange={handleChange} type="number" step="0.01" required />
                    </div>
                    {type !== 'CONCIERGE' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Stock</label>
                            <Input name="stock" value={formData.stock} onChange={handleChange} type="number" required />
                        </div>
                    )}
                </div>

                {type !== 'CONCIERGE' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Virtual Content (Delivery)</label>
                        <Input name="content" value={formData.content} onChange={handleChange} placeholder="Secret code, link, or ticket ID..." />
                        <p className="text-xs text-muted-foreground">Hidden until purchased. For tickets, you might verify this manualy later.</p>
                    </div>
                )}

                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading}>{loading ? "Updating..." : "Update Product"}</Button>
                </div>
            </form>
        </div>
    )
}
