"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { Check, ChevronsUpDown } from "lucide-react"

type CityData = {
    en: string
    zh: string
    ru: string
}

type AttractionSimple = { id: string, name: string, city: string }

export default function NewProductClient({ existingCities, attractions = [] }: { existingCities: CityData[], attractions?: AttractionSimple[] }) {
    const router = useRouter()
    const { dict } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [image, setImage] = useState("")
    const [uploading, setUploading] = useState(false)

    // City Autocomplete State
    const [openCity, setOpenCity] = useState(false)

    // Controlled Form State
    const [formData, setFormData] = useState({
        type: "VIRTUAL",
        title: "",
        description: "",
        titleZh: "",
        descriptionZh: "",
        titleRu: "",
        descriptionRu: "",
        city: "",
        cityZh: "",
        cityRu: "",
        price: "",
        stock: "",
        content: "",
        location: "",
        venue: "",
        googleMapLink: "",
        yandexMapLink: "",
        attractionId: ""

    })

    // Existing products for auto-fill
    const [existingProducts, setExistingProducts] = useState<any[]>([])

    // Fetch existing products when attraction changes
    const fetchExistingProducts = async (attrId: string) => {
        if (!attrId) {
            setExistingProducts([])
            return
        }
        try {
            const res = await fetch(`/api/products?attractionId=${attrId}`)
            if (res.ok) {
                const data = await res.json()
                setExistingProducts(data)
            }
        } catch (e) {
            console.error("Failed to fetch existing products", e)
        }
    }

    const handleTemplateSelect = (productId: string) => {
        const p = existingProducts.find(prod => prod.id === productId)
        if (p) {
            setFormData(prev => ({
                ...prev,
                title: p.title,
                titleZh: p.titleZh || "",
                titleRu: p.titleRu || "",
                description: p.description,
                descriptionZh: p.descriptionZh || "",
                descriptionRu: p.descriptionRu || "",
                // We don't overwrite price/stock as those might differ per specific ticket/date
            }))
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // If attraction is selected, auto-fill city
        if (name === 'attractionId' && value) {
            const attr = attractions?.find(a => a.id === value)
            if (attr) {
                setFormData(prev => ({
                    ...prev,
                    city: attr.city,
                    attractionId: value,
                    location: attr.name
                }))
                // Fetch existing products for this attraction
                fetchExistingProducts(value)
            }
        } else if (name === 'attractionId') {
            // Cleared
            setExistingProducts([])
        }
    }

    const handleCitySelect = (cityData: CityData) => {
        setFormData(prev => ({
            ...prev,
            city: cityData.en,
            cityZh: cityData.zh || prev.cityZh,
            cityRu: cityData.ru || prev.cityRu
        }))
        setOpenCity(false)
    }

    async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.[0]) return;
        setUploading(true);
        const data = new FormData();
        data.append("file", e.target.files[0]);
        try {
            const res = await fetch("/api/upload", { method: "POST", body: data });
            const json = await res.json();
            if (json.url) setImage(json.url);
        } catch (err) { alert("Upload failed"); }
        finally { setUploading(false); }
    }

    // Slot Generator Logic
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0])
    const [startTime, setStartTime] = useState("09:00")
    const [endTime, setEndTime] = useState("17:00")
    const [interval, setInterval] = useState(60)
    const [generatedSlots, setGeneratedSlots] = useState("")
    const [slotTimesInput, setSlotTimesInput] = useState("")

    // Days of week configuration
    const [selectedDays, setSelectedDays] = useState({
        0: true, // Sunday
        1: true, // Monday
        2: true, // Tuesday
        3: true, // Wednesday
        4: true, // Thursday
        5: true, // Friday
        6: true  // Saturday
    })

    const daysMap = [
        { id: 1, label: "Mon" },
        { id: 2, label: "Tue" },
        { id: 3, label: "Wed" },
        { id: 4, label: "Thu" },
        { id: 5, label: "Fri" },
        { id: 6, label: "Sat" },
        { id: 0, label: "Sun" },
    ]

    function generateSlots() {
        if (formData.type !== 'ATTRACTION' && formData.type !== 'THEATER') return;

        const slots: string[] = []
        let current = new Date(startDate)
        const end = new Date(endDate)

        while (current <= end) {
            const dayOfWeek = current.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6

            if (selectedDays[dayOfWeek]) {
                const dateStr = current.toISOString().split('T')[0]

                // Time generation
                const [startH, startM] = startTime.split(':').map(Number)
                const [endH, endM] = endTime.split(':').map(Number)

                let timeDate = new Date(current)
                timeDate.setHours(startH, startM, 0, 0)

                const endTimeDate = new Date(current)
                endTimeDate.setHours(endH, endM, 0, 0)

                while (timeDate < endTimeDate) {
                    const timeStr = timeDate.toTimeString().slice(0, 5) // HH:MM
                    slots.push(`${dateStr} ${timeStr}`)
                    timeDate.setMinutes(timeDate.getMinutes() + interval)
                }
            }

            current.setDate(current.getDate() + 1)
        }

        setGeneratedSlots(slots.join('\n'))
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const submitData: any = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            image,
        }

        if (formData.type === "ATTRACTION" && formData.attractionId) {
            submitData.slotTimes = slotTimesInput
                .split(/[\n,]+/)
                .map((s: string) => s.trim())
                .map((s: string) => {
                    // Pad single-digit hours: "9:00" -> "09:00"
                    if (/^\d:[0-5]\d$/.test(s)) {
                        return "0" + s;
                    }
                    return s;
                })
                .filter((s: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s));
        } else {
            submitData.slotTimes = null;
            if ((formData.type === "ATTRACTION" || formData.type === "THEATER") && generatedSlots) {
                submitData.availableSlots = generatedSlots.split('\n').map((s: string) => s.trim()).filter(Boolean);
            }
        }

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                body: JSON.stringify(submitData)
            });
            if (!res.ok) throw new Error("Failed");
            router.push("/admin/products");
            router.refresh();
        } catch (err) {
            console.error(err);
            alert("Error creating product");
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{dict.admin.addProduct}</h2>
                <LanguageSwitcher />
            </div>

            <form onSubmit={onSubmit} className="space-y-6 glass-card p-8">

                {/* Type Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">{dict.admin.form.type}</label>
                    <div className="grid grid-cols-2 gap-4">
                        <select name="type" value={formData.type} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="VIRTUAL">{dict.admin.form.virtual}</option>
                            <option value="ATTRACTION">{dict.admin.form.attraction}</option>
                            <option value="THEATER">{dict.admin.form.theater}</option>
                            <option value="CONCIERGE">Purchasing Service (代买服务)</option>
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

                {/* Template Selection */}
                {
                    existingProducts.length > 0 && (
                        <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-md">
                            <label className="text-sm font-medium mb-2 block">Copy info from existing product</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                onChange={(e) => handleTemplateSelect(e.target.value)}
                                defaultValue=""
                            >
                                <option value="" disabled>-- Select to auto-fill details --</option>
                                {existingProducts.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground mt-1">Selecting a product will auto-fill titles and descriptions.</p>
                        </div>
                    )
                }

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
                            <textarea name="description" value={formData.description} onChange={handleChange} required className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Description" />
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
                            <textarea name="descriptionZh" value={formData.descriptionZh} onChange={handleChange} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="产品详情" />
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
                            <textarea name="descriptionRu" value={formData.descriptionRu} onChange={handleChange} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Описание товара" />
                        </div>

                    </TabsContent>
                </Tabs>

                {/* Attraction Time Slots UI */}
                {
                    (formData.type === 'ATTRACTION' || formData.type === 'THEATER') && (
                        <div className="p-4 border border-teal-500/30 rounded-lg bg-teal-500/5 space-y-4">
                            <h3 className="font-semibold text-teal-400">Time Slot Configuration (Attraction / Theater)</h3>
                            
                            {formData.type === 'ATTRACTION' && formData.attractionId ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Custom Daily Slot Times (Split Sessions)</label>
                                    <textarea
                                        name="slotTimes"
                                        value={slotTimesInput}
                                        onChange={(e) => setSlotTimesInput(e.target.value)}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                                        placeholder="e.g. 10:00, 11:00, 13:30, 14:30"
                                    />
                                    <p className="text-xs text-muted-foreground text-teal-400/70">
                                        Leave blank to use the attraction's default hours. Write comma or newline-separated times to specify split sessions (e.g. morning/afternoon start times).
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium">Start Date</label>
                                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium">End Date</label>
                                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium">Start Time</label>
                                            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium">End Time</label>
                                            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                                        </div>
                                    </div>

                                    {/* Days Selection */}
                                    <div>
                                        <label className="text-xs font-medium mb-2 block">Operating Days</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {daysMap.map(day => (
                                                <button
                                                    key={day.id}
                                                    type="button"
                                                    onClick={() => setSelectedDays(prev => ({ ...prev, [day.id]: !prev[day.id as 0 | 1 | 2 | 3 | 4 | 5 | 6] }))}
                                                    className={`px-3 py-1 rounded text-xs border transition-colors ${selectedDays[day.id as 0 | 1 | 2 | 3 | 4 | 5 | 6]
                                                        ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                                                        : 'bg-background border-input text-muted-foreground'
                                                        }`}
                                                >
                                                    {day.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium">Interval (minutes)</label>
                                        <Input type="number" value={interval} onChange={e => setInterval(parseInt(e.target.value))} />
                                    </div>
                                    <Button type="button" onClick={generateSlots} variant="secondary" className="w-full">
                                        Generate Slots
                                    </Button>
                                    <div>
                                        <label className="text-xs font-medium">Generated Slots (JSON/Array preview)</label>
                                        <textarea
                                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono"
                                            value={generatedSlots}
                                            onChange={e => setGeneratedSlots(e.target.value)}
                                            placeholder="YYYY-MM-DD HH:MM per line..."
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {generatedSlots ? `${generatedSlots.split('\n').filter(Boolean).length} slots generated` : "No slots generated"}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )
                }

                {/* Maps */}


                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{dict.admin.form.price} (₽ RUB)</label>
                        <Input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{dict.admin.form.stock}</label>
                        <Input name="stock" type="number" value={formData.stock} onChange={handleChange} required placeholder="100" />
                    </div>
                </div>

                {/* Image */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">{dict.admin.form.imageLabel}</label>
                    <Input type="file" onChange={onUpload} />
                    {image && <img src={image} className="w-20 h-20 object-cover mt-2 rounded" />}
                </div>

                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => router.back()}>{dict.admin.cancel}</Button>
                    <Button type="submit" disabled={loading}>{loading ? dict.admin.saving : dict.admin.createProduct}</Button>
                </div>
            </form >
        </div >
    )
}
