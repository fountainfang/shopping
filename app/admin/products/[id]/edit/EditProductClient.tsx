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
    const { dict } = useLanguage()
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
        attractionId: product.attractionId || "",
        conciergeFields: product.conciergeFields ? JSON.stringify(product.conciergeFields, null, 2) : "",
        markupRules: product.markupRules ? JSON.stringify(product.markupRules, null, 2) : "",
        autoDeliveryType: product.autoDeliveryType || "FIXED",
        apiDeliveryUrl: product.apiDeliveryUrl || "",
        cdkPoolInput: Array.isArray(product.cdkPool) ? product.cdkPool.join('\n') : ""
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
    const [slotTimesInput, setSlotTimesInput] = useState(
        Array.isArray(product.slotTimes) ? product.slotTimes.join(', ') : ""
    )

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
            stock: parseInt(String(formData.stock || "0")),
        }

        if (type === "AUTO_DELIVERY") {
            submitData.autoDeliveryType = formData.autoDeliveryType;
            if (formData.autoDeliveryType === "POOL") {
                const pool = formData.cdkPoolInput
                    .split("\n")
                    .map((s: string) => s.trim())
                    .filter(Boolean);
                submitData.cdkPool = pool;
                submitData.stock = pool.length;
            } else if (formData.autoDeliveryType === "API") {
                submitData.apiDeliveryUrl = formData.apiDeliveryUrl;
                submitData.cdkPool = null;
            } else if (formData.autoDeliveryType === "FIXED") {
                submitData.content = formData.content;
                submitData.cdkPool = null;
                submitData.apiDeliveryUrl = null;
            }
        } else {
            submitData.autoDeliveryType = null;
            submitData.cdkPool = null;
            submitData.apiDeliveryUrl = null;
        }

        delete submitData.cdkPoolInput;

        if (type === "CONCIERGE") {
            try {
                submitData.conciergeFields = formData.conciergeFields ? JSON.parse(formData.conciergeFields) : null;
            } catch (e) {
                alert("Invalid JSON format in Dynamic Fields!");
                setLoading(false);
                return;
            }

            try {
                submitData.markupRules = formData.markupRules ? JSON.parse(formData.markupRules) : null;
            } catch (e) {
                alert("Invalid JSON format in Markup Rules!");
                setLoading(false);
                return;
            }
        }

        // Handle Available Slots for Attraction
        if (type === "ATTRACTION" || type === "THEATER") {
            if (type === "ATTRACTION" && formData.attractionId) {
                // If linked to an attraction, slots are generated automatically from custom slotTimes
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
                if (generatedSlots) {
                    // split by new lines
                    submitData.availableSlots = generatedSlots.split('\n').map((s: string) => s.trim()).filter(Boolean);
                }
            }
        } else {
            submitData.slotTimes = null;
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
                            <option value="CONCIERGE">Purchasing Service (代买服务)</option>
                            <option value="AUTO_DELIVERY">Auto Delivery (自动发货)</option>
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

                    </TabsContent>
                </Tabs>

                {/* Maps */}


                {/* Conditional Fields */}
                {(type === 'ATTRACTION' || type === 'THEATER') && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{dict.admin.form.price} (₽ RUB)</label>
                        <Input name="location" value={formData.location} onChange={handleChange} placeholder={type === 'THEATER' ? "Theater Name" : "Attraction Address"} />
                    </div>
                )}

                {type === 'THEATER' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Venue / Hall</label>
                        <Input name="venue" value={formData.venue} onChange={handleChange} placeholder="Hall 1, IMAX Room..." />
                    </div>
                )}

                {/* Concierge Custom Configurations */}
                {type === 'CONCIERGE' && (
                    <div className="p-4 border border-indigo-500/30 rounded-lg bg-indigo-500/5 space-y-4">
                        <h3 className="font-semibold text-indigo-400">Concierge Configuration</h3>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium block text-muted-foreground">Dynamic Fields (JSON)</label>
                            <textarea
                                name="conciergeFields"
                                value={formData.conciergeFields}
                                onChange={handleChange}
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono"
                                placeholder={`e.g. [\n  { "name": "account", "label": "Account (Username)", "placeholder": "Enter username", "type": "text", "required": true }\n]`}
                            />
                            <p className="text-[10px] text-muted-foreground">Specify the fields the customer must fill in. Leave empty to only require a Target Link.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium block text-muted-foreground">Price Markup Rules (JSON)</label>
                            <textarea
                                name="markupRules"
                                value={formData.markupRules}
                                onChange={handleChange}
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono"
                                placeholder={`e.g. [\n  { "min": 0, "max": 1000, "percent": 10, "fixed": 50 },\n  { "min": 1000, "max": 999999, "percent": 5, "fixed": 100 }\n]`}
                            />
                            <p className="text-[10px] text-muted-foreground">Tiered pricing markup on the Ruble amount before USD/USDT conversion.</p>
                        </div>
                    </div>
                )}

                {/* Auto Delivery Custom Configurations */}
                {type === 'AUTO_DELIVERY' && (
                    <div className="p-4 border border-purple-500/30 rounded-lg bg-purple-500/5 space-y-4">
                        <h3 className="font-semibold text-purple-400">Auto Delivery Configuration</h3>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Delivery Mode</label>
                            <select
                                name="autoDeliveryType"
                                value={formData.autoDeliveryType}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="FIXED">FIXED (Deliver static virtual content)</option>
                                <option value="POOL">POOL (Deliver unique CDK/credentials from pool)</option>
                                <option value="API">API (Fetch CDK/credentials dynamically from URL)</option>
                            </select>
                        </div>

                        {formData.autoDeliveryType === 'FIXED' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Virtual Content (Fixed Delivery)</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                                    placeholder="Enter download link, shared credentials, or delivery text..."
                                    required
                                />
                                <p className="text-xs text-muted-foreground">This content will be shown/sent to the buyer immediately after payment.</p>
                            </div>
                        )}

                        {formData.autoDeliveryType === 'POOL' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">CDK Pool (One item per line)</label>
                                <textarea
                                    name="cdkPoolInput"
                                    value={formData.cdkPoolInput}
                                    onChange={handleChange}
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                                    placeholder={`credential1\ncredential2\ncredential3`}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Each order will consume one line. The remaining lines represent the stock. Stock will be set automatically based on line count.</p>
                            </div>
                        )}

                        {formData.autoDeliveryType === 'API' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">API Delivery URL</label>
                                <Input
                                    name="apiDeliveryUrl"
                                    value={formData.apiDeliveryUrl}
                                    onChange={handleChange}
                                    placeholder="https://api.example.com/get-cdk?orderId="
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Upon payment, the system will send a GET request to this URL. The response body will be delivered as-is to the user.</p>
                            </div>
                        )}
                    </div>
                )}

                {(type === 'ATTRACTION' || type === 'THEATER') && (
                    <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                        <h3 className="font-semibold text-sm">Booking Slots Configuration</h3>
                        
                        {type === 'ATTRACTION' && formData.attractionId ? (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Custom Daily Slot Times (Split Sessions)</label>
                                <Textarea
                                    name="slotTimes"
                                    value={slotTimesInput}
                                    onChange={(e) => setSlotTimesInput(e.target.value)}
                                    className="font-mono min-h-[80px] bg-background border-input text-foreground px-3 py-2 rounded-md"
                                    placeholder="e.g. 10:00, 11:00, 13:30, 14:30"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Leave blank to use the attraction's default hours. Write comma or newline-separated times to specify split sessions (e.g. morning/afternoon start times).
                                </p>
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{dict.admin.form.price} (₽ RUB)</label>
                        <Input name="price" value={formData.price} onChange={handleChange} type="number" step="0.01" required placeholder="0.00" />
                    </div>
                    {type !== 'CONCIERGE' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Stock</label>
                            <Input
                                name="stock"
                                value={type === 'AUTO_DELIVERY' && formData.autoDeliveryType === 'POOL'
                                    ? (formData.cdkPoolInput.split('\n').filter((s: string) => s.trim()).length)
                                    : formData.stock}
                                onChange={handleChange}
                                type="number"
                                disabled={type === 'AUTO_DELIVERY' && formData.autoDeliveryType === 'POOL'}
                                required
                            />
                        </div>
                    )}
                </div>

                {type !== 'CONCIERGE' && type !== 'AUTO_DELIVERY' && (
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
