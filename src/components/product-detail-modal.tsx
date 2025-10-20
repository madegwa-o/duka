"use client"

import Image from "next/image"
import { X, Mail, Phone } from "lucide-react"
import { useState } from "react"

interface PopulatedProduct {
    _id: string;
    name: string;
    price: number;
    category: {
        _id: string;
        name: string;
        slug: string;
    };
    images: Array<{
        _id: string;
        url: string;
        label?: string;
    }>;
    createdAt: string;
}

interface ProductDetailModalProps {
    product: PopulatedProduct
    onClose: () => void
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const hasMultipleImages = product.images && product.images.length > 1

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
                        <Image
                            src={`/api/r2/images/${encodeURIComponent(product.images?.[currentImageIndex]?.url || "/placeholder.svg")}`}
                            alt={`${product.name} - Image ${currentImageIndex + 1}`}
                            fill
                            className="object-cover"
                        />

                        {hasMultipleImages && (
                            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                                {product.images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`h-2 w-2 rounded-full transition-all ${
                                            idx === currentImageIndex
                                                ? 'w-8 bg-foreground'
                                                : 'bg-foreground/40 hover:bg-foreground/60'
                                        }`}
                                        aria-label={`View image ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-between p-6 md:p-8">
                        <div>
                            <div className="mb-2 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                {product.category.name}
                            </div>
                            <h2 className="mt-2 font-sans text-3xl font-medium leading-tight text-foreground">
                                {product.name}
                            </h2>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-medium text-foreground">
                                    sh{product.price.toFixed(2)}
                                </span>
                                <span className="text-sm text-muted-foreground">KES</span>
                            </div>

                            <button className="w-full rounded-sm bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-foreground/90">
                                Contact Seller
                            </button>

                            <div className="mt-6 space-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
                                <p className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Contact via email
                                </p>
                                <p className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Call for inquiries
                                </p>
                                {hasMultipleImages && (
                                    <p>• {product.images.length} images available</p>
                                )}
                                <p>• Added {new Date(product.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}