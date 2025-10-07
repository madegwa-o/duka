"use client"

import type { Product } from "@/lib/data"
import Image from "next/image"
import { X } from "lucide-react"

interface ProductDetailModalProps {
    product: Product
    onClose: () => void
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-sm bg-card shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground transition-colors hover:bg-background"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="relative aspect-[3/4] w-full overflow-hidden md:rounded-l-sm">
                        <Image src={product.imageUrl || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
                    </div>

                    <div className="flex flex-col justify-between p-6 md:p-8">
                        <div>
                            <div className="mb-2 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                {product.category}
                            </div>
                            <h2 className="mt-2 font-sans text-3xl font-medium leading-tight text-foreground">{product.title}</h2>
                            <p className="mt-4 leading-relaxed text-muted-foreground">{product.description}</p>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-medium text-foreground">${product.price}</span>
                                <span className="text-sm text-muted-foreground">USD</span>
                            </div>

                            <button className="w-full rounded-sm bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-foreground/90">
                                Add to Cart
                            </button>

                            <button className="w-full rounded-sm border border-border bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted">
                                Contact Artist
                            </button>

                            <div className="mt-6 space-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
                                <p>• Original artwork</p>
                                <p>• Certificate of authenticity included</p>
                                <p>• Secure packaging and shipping</p>
                                <p>• 14-day return policy</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
