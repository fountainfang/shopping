"use client"

import { useState } from "react"
import { Product } from "@prisma/client"
import Link from "next/link"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CityFilter({ products, dict }: { products: Product[], dict: any }) {
    const [selectedCity, setSelectedCity] = useState<string>("All")

    // Extract unique cities, filtering out null/undefined/empty
    const cities = ["All", ...Array.from(new Set(products.map(p => (p as any).city).filter(Boolean)))];

    const filteredProducts = selectedCity === "All"
        ? products
        : products.filter(p => (p as any).city === selectedCity);

    return (
        <div className="space-y-8">
            {/* City Tabs */}
            {cities.length > 1 && (
                <div className="flex flex-wrap gap-2 justify-center">
                    {cities.map((city) => (
                        <button
                            key={city as string}
                            onClick={() => setSelectedCity(city as string)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                selectedCity === city
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                            )}
                        >
                            {city as string}
                        </button>
                    ))}
                </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                        <div className="aspect-video bg-muted/50 p-6 flex items-center justify-center">
                            <Zap className="w-12 h-12 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg tracking-tight">{product.title}</h3>
                                <div className="font-bold text-primary">${product.price}</div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {product.description}
                            </p>
                            <Link href={`/buy/${product.id}`}>
                                <Button className="w-full gap-2">
                                    {dict.home.buyNow}
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}

                {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No products found in {selectedCity}.
                    </div>
                )}
            </div>
        </div>
    )
}
