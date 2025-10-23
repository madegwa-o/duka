"use client"

import type React from "react"

import Image from "next/image"
import { X, Phone, MessageCircle, Share2, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"
import { useState, useEffect } from "react"
import useSWR from "swr"
import ShareComponent from "@/components/share-component"

export interface PopulatedProduct {
    _id: string;
    name: string;
    description?: string;
    price: number;
    category: {
        _id: string;
        name: string;
        slug: string;
    };
    shop: {
        _id: string;
        name: string;
        owners?: Array<{
            _id: string;
            name: string;
            phone?: string;
            email?: string;
        }>;
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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ProductDetailModal({ product: initialProduct, onClose }: ProductDetailModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [touchStart, setTouchStart] = useState(0)
    const [touchEnd, setTouchEnd] = useState(0)
    const [showShare, setShowShare] = useState(false)
    const [isAddingToCart, setIsAddingToCart] = useState(false)
    const [cartMessage, setCartMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const { data, isLoading } = useSWR(`/api/products/${initialProduct._id}`, fetcher, {
        fallbackData: { product: initialProduct },
        revalidateOnFocus: false,
    })

    const product = data?.product || initialProduct
    const hasMultipleImages = product.images && product.images.length > 1
    const seller = product.shop?.owners?.[0]


    console.log('seller: ',seller)
    console.log('initial product: ',initialProduct)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                handlePrevImage()
            } else if (e.key === "ArrowRight") {
                handleNextImage()
            } else if (e.key === "Escape") {
                onClose()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [currentImageIndex, product.images.length])

    // Clear cart message after 3 seconds
    useEffect(() => {
        if (cartMessage) {
            const timer = setTimeout(() => setCartMessage(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [cartMessage])

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
    }

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX)
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        setTouchEnd(e.changedTouches[0].clientX)
        handleSwipe()
    }

    const handleSwipe = () => {
        if (!touchStart || !touchEnd) return

        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > 50
        const isRightSwipe = distance < -50

        if (isLeftSwipe) {
            handleNextImage()
        } else if (isRightSwipe) {
            handlePrevImage()
        }
    }

    const handleCallSeller = () => {
        if (seller?.phone) {
            window.location.href = `tel:${seller.phone}`
        }
    }

    const handleWhatsAppSeller = () => {
        if (seller?.phone) {
            const message = `Hi, I'm interested in "${product.name}" listed on Duka. Is it still available?`
            const whatsappUrl = `https://wa.me/${seller.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
            window.open(whatsappUrl, "_blank")
        }
    }

    const handleAddToCart = async () => {
        setIsAddingToCart(true)
        setCartMessage(null)

        try {
            const response = await fetch('/api/my-cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: product._id
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add to cart')
            }

            setCartMessage({ type: 'success', text: data.message || 'Added to cart successfully!' })
        } catch (error) {
            setCartMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to add to cart'
            })
        } finally {
            setIsAddingToCart(false)
        }
    }

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

                {/* Cart Message Toast */}
                {cartMessage && (
                    <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-sm shadow-lg ${
                        cartMessage.type === 'success'
                            ? 'bg-success text-success-foreground'
                            : 'bg-destructive text-destructive-foreground'
                    }`}>
                        {cartMessage.text}
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Image Section */}
                    <div
                        className="relative aspect-[3/4] w-full overflow-hidden md:rounded-l-sm"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full bg-muted">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                            </div>
                        ) : (
                            <>
                                <Image
                                    src={`/api/r2/images/${encodeURIComponent(product.images?.[currentImageIndex]?.url || "/placeholder.svg")}`}
                                    alt={`${product.name} - Image ${currentImageIndex + 1}`}
                                    fill
                                    className="object-cover"
                                    priority
                                />

                                {/* Image Navigation Arrows */}
                                {hasMultipleImages && (
                                    <>
                                        <button
                                            onClick={handlePrevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground transition-colors hover:bg-background"
                                            aria-label="Previous image"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={handleNextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground transition-colors hover:bg-background"
                                            aria-label="Next image"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </>
                                )}

                                {/* Image Indicators */}
                                {hasMultipleImages && (
                                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                                        {product.images.map((_: PopulatedProduct['images'][number], idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                className={`h-2 w-2 rounded-full transition-all ${
                                                    idx === currentImageIndex ? "w-8 bg-foreground" : "bg-foreground/40 hover:bg-foreground/60"
                                                }`}
                                                aria-label={`View image ${idx + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Image Counter */}
                                {hasMultipleImages && (
                                    <div className="absolute top-4 left-4 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground">
                                        {currentImageIndex + 1} / {product.images.length}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col justify-between p-6 md:p-8">
                        <div>
                            <div className="mb-2 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                {product.category.name}
                            </div>
                            <h2 className="mt-2 font-sans text-3xl font-medium leading-tight text-foreground">{product.name}</h2>

                            {product.description && (
                                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
                            )}
                        </div>

                        <div className="mt-8 space-y-4">
                            {/* Price */}
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-medium text-foreground">sh{product.price.toFixed(2)}</span>
                                <span className="text-sm text-muted-foreground">KES</span>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={isAddingToCart}
                                className="w-full flex items-center justify-center gap-2 rounded-sm bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAddingToCart ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="h-4 w-4" />
                                        Add to Cart
                                    </>
                                )}
                            </button>

                            {/* Contact Buttons */}
                            <div className="space-y-2">
                                {seller?.phone && (
                                    <>
                                        <button
                                            onClick={handleCallSeller}
                                            className="w-full flex items-center justify-center gap-2 rounded-sm bg-accent px-6 py-3 font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                                        >
                                            <Phone className="h-4 w-4" />
                                            Call {seller.name}
                                        </button>
                                        <button
                                            onClick={handleWhatsAppSeller}
                                            className="w-full flex items-center justify-center gap-2 rounded-sm bg-success px-6 py-3 font-medium text-success-foreground transition-colors hover:bg-success/90"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            WhatsApp
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="border-t border-border pt-4">
                                <button
                                    onClick={() => setShowShare(!showShare)}
                                    className="w-full flex items-center justify-center gap-2 rounded-sm border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                                >
                                    <Share2 className="h-4 w-4" />
                                    Share Product
                                </button>

                                {showShare && (
                                    <div className="mt-4">
                                        <ShareComponent
                                            productId={product._id}
                                            productName={product.name}
                                            productPrice={product.price}
                                            shopName={product.shop.name}
                                            variant="modal"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="space-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
                                <p>Shop: {product.shop.name}</p>
                                {seller && <p>Seller: {seller.name}</p>}
                                {hasMultipleImages && <p>• {product.images.length} images available</p>}
                                <p>• Added {new Date(product.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}