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
                                    {/* Delivery Content Display */}
                                    {order.status === 'completed' && order.deliveryContent && (
                                        <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md text-sm">
                                            <span className="block font-bold text-green-500 text-xs uppercase mb-1">
                                                {dict.orders?.deliveryContent || "Delivery Content"}:
                                            </span>
                                            <div className="font-mono text-foreground break-all whitespace-pre-wrap select-all">
                                                {order.deliveryContent}
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {formatDate(order.createdAt)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'completed' || order.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                                        order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                            'bg-red-500/10 text-red-500'
                                        }`}>
                                        {order.status.toUpperCase()}
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
