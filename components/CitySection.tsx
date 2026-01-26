"use client"

import { Product } from "@prisma/client"
import Link from "next/link"
import { motion } from "framer-motion"

interface CitySectionProps {
    title: string
    products: Product[]
    colorClass: string // e.g. "bg-blue-600"
}

export function CitySection({ title, products, colorClass }: CitySectionProps) {
    if (products.length === 0) return null

    return (
        <div className="mb-8">
            <div className="flex items-center gap-6 mb-4">
                <h2 className="text-3xl font-bold text-white whitespace-nowrap min-w-[120px]">{title}</h2>
                <div className="flex flex-wrap gap-3">
                    {products.map((product) => (
                        <Link key={product.id} href={`/buy/${product.id}`}>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`${colorClass} text-white px-4 py-2 rounded shadow-md hover:brightness-110 transition-all font-medium text-sm`}
                            >
                                {product.title}
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
