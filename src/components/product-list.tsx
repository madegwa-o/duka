"use client"

import { memo } from "react"
import { Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { Product } from "@/hooks/use-products"

interface ProductListProps {
    products: Product[]
    onCreateClick: () => void
}

export const ProductList = memo(function ProductList({ products, onCreateClick }: ProductListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            My Products ({products.length})
          </span>
                    <Button size="sm" onClick={onCreateClick}>
                        <Package className="mr-2 h-4 w-4" />
                        New Product
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="relative w-32 h-32 mb-4">
                            <Image
                                src="/logo.png"
                                alt="Duka"
                                fill
                                className="object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
                                priority
                            />
                        </div>
                        <p className="text-muted-foreground mb-4 text-sm">No Products yet</p>
                        <Button onClick={onCreateClick} className="shadow-sm hover:shadow-md transition-all">
                            Create Your First Product
                        </Button>
                    </div>

                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map((product) => (
                            <div key={product._id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                                {product.images.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        {product.images.map((img, idx) => (
                                            <Image
                                                key={idx}
                                                src={`/api/r2/images/${encodeURIComponent(img.url)}`}
                                                alt={img.label || product.name}
                                                width={200}
                                                height={96}
                                                className="w-full h-24 object-cover rounded"
                                            />
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{product.name}</h3>
                                        <p className="text-sm text-muted-foreground">{product.category?.name || "No category"}</p>
                                        <p className="text-lg font-bold text-primary mt-2">sh{product.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">{product.shop.name}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
})
