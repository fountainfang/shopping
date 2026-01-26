"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Truck } from "lucide-react"

export default function AdminOrdersPage({ orders }: { orders: any[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)
    const [shippingId, setShippingId] = useState<string | null>(null)
    const [deliveryContent, setDeliveryContent] = useState("")

    async function onConfirmShip() {
        if (!shippingId) return
        if (!deliveryContent.trim()) {
            alert("Please enter delivery content")
            return
        }

        setLoading(shippingId)
        try {
            const res = await fetch(`/api/orders/${shippingId}/ship`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deliveryContent })
            })
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to update status");
            }
            router.refresh()
            setShippingId(null)
            setDeliveryContent("")
        } catch (e: any) {
            alert(e.message || "Failed to update status")
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Customer Orders</h2>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                            <th className="px-6 py-3 font-medium">Order ID</th>
                            <th className="px-6 py-3 font-medium">Customer</th>
                            <th className="px-6 py-3 font-medium">Product</th>
                            <th className="px-6 py-3 font-medium">Details</th>
                            <th className="px-6 py-3 font-medium">Price</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <>
                                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                                        <td className="px-6 py-4">{order.user.email}</td>
                                        <td className="px-6 py-4">
                                            <div>{order.product.title}</div>
                                            <div className="text-xs text-muted-foreground">{order.product.type}</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {order.bookingDate && (
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">Booking:</span>
                                                    <span>{new Date(order.bookingDate).toLocaleString()}</span>
                                                </div>
                                            )}
                                            {order.targetLink && (
                                                <div className="flex flex-col mt-1">
                                                    <span className="font-semibold">Target Link:</span>
                                                    <a href={order.targetLink} target="_blank" className="text-primary hover:underline truncate max-w-[150px]">
                                                        {order.targetLink}
                                                    </a>
                                                </div>
                                            )}
                                            {order.additionalInfo && (
                                                <div className="mt-1 text-muted-foreground italic">
                                                    "{order.additionalInfo}"
                                                </div>
                                            )}
                                            {!order.bookingDate && !order.targetLink && !order.additionalInfo && (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-green-500">${order.price}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs text-center border ${order.status === 'completed'
                                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                : order.status === 'paid'
                                                    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {order.status === 'paid' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-2 text-primary hover:text-primary"
                                                    disabled={loading === order.id}
                                                    onClick={() => {
                                                        if (shippingId === order.id) {
                                                            setShippingId(null); // Toggle off
                                                        } else {
                                                            setShippingId(order.id);
                                                            setDeliveryContent(""); // Reset content
                                                        }
                                                    }}
                                                >
                                                    <Truck className="w-4 h-4" />
                                                    {shippingId === order.id ? "Cancel" : "Ship Item"}
                                                </Button>
                                            )}
                                            {order.status === 'completed' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-2 text-muted-foreground hover:text-foreground"
                                                    disabled={loading === order.id}
                                                    onClick={() => {
                                                        setShippingId(order.id);
                                                        setDeliveryContent(order.deliveryContent || "");
                                                    }}
                                                >
                                                    <Truck className="w-4 h-4" />
                                                    Edit
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                    {/* Inline Shipping Form */}
                                    {shippingId === order.id && (
                                        <tr className="bg-muted/20">
                                            <td colSpan={7} className="px-6 py-4">
                                                <div className="flex gap-4 items-end">
                                                    <div className="flex-1 space-y-2">
                                                        <label className="text-sm font-medium">
                                                            Delivery Content (Link / Code / Message)
                                                        </label>
                                                        <input
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            value={deliveryContent}
                                                            onChange={(e) => setDeliveryContent(e.target.value)}
                                                            placeholder="e.g. https://ticket-link.com/download/123 or Ticket Code: ABC-123"
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={onConfirmShip}
                                                        disabled={loading === order.id}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        {loading === order.id ? "Sending..." : "Confirm & Send"}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
