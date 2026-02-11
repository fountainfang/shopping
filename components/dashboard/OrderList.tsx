"use client"

import { useLanguage } from "@/lib/i18n/LanguageContext"
import { formatDate, formatCurrency } from "@/lib/utils"

export function OrderList({ orders }: { orders: any[] }) {
    const { dict } = useLanguage()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">{dict.orders.title}</h2>
                <p className="text-muted-foreground">
                    {dict.orders.subtitle}
                </p>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                            <th className="px-6 py-3 font-medium">{dict.orders.orderId}</th>
                            <th className="px-6 py-3 font-medium">{dict.orders.product}</th>
                            <th className="px-6 py-3 font-medium">{dict.orders.date}</th>
                            <th className="px-6 py-3 font-medium">{dict.orders.status}</th>
                            <th className="px-6 py-3 font-medium text-right">{dict.orders.amount}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                    {order.id.slice(-8).toUpperCase()}
                                </td>
                                <td className="px-6 py-4 font-medium">
                                    {order.product.title}
                                    {order.bookingDate && (
                                        <span className="block text-xs text-muted-foreground mt-1">
                                            {dict.orders.booking}: {formatDate(order.bookingDate)}
                                        </span>
                                    )}
                                    {/* Delivery Content / Message Display */}
                                    {order.deliveryContent && (
                                        <div className={`mt-2 p-3 border rounded-md text-sm ${order.status === 'completed'
                                                ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400'
                                                : 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400'
                                            }`}>
                                            <span className="block font-bold text-xs uppercase mb-1 opacity-70">
                                                {order.status === 'completed' ? (dict.orders?.deliveryContent || "Delivery Content") : "Message from Admin"}:
                                            </span>
                                            <div className="font-mono break-all whitespace-pre-wrap select-all">
                                                {order.deliveryContent}
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs text-muted-foreground block mb-1">{formatDate(order.createdAt)}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold inline-block ${order.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                            order.status === 'paid' ? 'bg-blue-500/10 text-blue-500' :
                                                order.status === 'refunded' ? 'bg-red-500/10 text-red-500 decoration-slice line-through opacity-80' :
                                                    'bg-yellow-500/10 text-yellow-500'
                                        }`}>
                                        {order.status === 'refunded' ? 'REFUNDED' : order.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {formatCurrency(order.price)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        {dict.orders.empty}
                    </div>
                )}
            </div>
        </div>
    )
}
