"use client"

import {useState, useEffect} from "react"
import { useSearchParams, useRouter} from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {ProductDetailModal} from "@/components/product-detail-modal"
import {ArrowLeft, Phone, MapPin} from "lucide-react"
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import EnhancedShareComponent from "@/components/share-component";

export interface PopulatedProduct {
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

interface Owner {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
    address?: string;
}

interface ShopData {
    _id: string;
    name: string;
    image?: {
        _id: string;
        url: string;
        label: string;
    };
    productCount: number;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse {
    success: boolean;
    shop: ShopData;
    owners: Owner[];
    products: PopulatedProduct[];
}

// Deterministic height generator (same as masonry-feeds)
const getProductHeight = (productId: string): number => {
    const hash = productId.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const heights = [250, 280, 320, 350, 380, 420, 450];
    return heights[Math.abs(hash) % heights.length];
};

interface ShopPageClientProps {
    shopId?: string
}

export default function ShopPage({shopId}: ShopPageClientProps) {

    const searchParams = useSearchParams()
    const router = useRouter()

    const productIdParam = searchParams.get("product")

    const [selectedProduct, setSelectedProduct] = useState<PopulatedProduct | null>(null)
    const [shopData, setShopData] = useState<ShopData | null>(null)
    const [owners, setOwners] = useState<Owner[]>([])
    const [products, setProducts] = useState<PopulatedProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch(`/api/feedshop/${shopId}`)

                if (!response.ok) {
                    throw new Error('Failed to fetch shop data')
                }

                const data: ApiResponse = await response.json()

                setShopData(data.shop)
                setOwners(data.owners)
                setProducts(data.products)

                // If there's a product ID in the URL, find and set it
                if (productIdParam) {
                    const product = data.products.find(p => p._id === productIdParam)
                    if (product) {
                        setSelectedProduct(product)
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchShopData()
    }, [shopId, productIdParam])

    const handleCloseModal = () => {
        setSelectedProduct(null)
        router.push(`/shop/${shopId}`, {scroll: false})
    }

    const handleProductClick = (product: PopulatedProduct) => {
        setSelectedProduct(product)
        router.push(`/shop/${shopId}?product=${product._id}`, {scroll: false})
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"/>
            </div>
        )
    }

    if (error || !shopData) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-destructive">
                        {error || 'Shop not found'}
                    </p>
                    <Link
                        href="/"
                        className="mt-4 inline-block rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        )
    }

    const primaryOwner = owners[0]

    return (
        <div className="min-h-screen">
            <header
                className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4"/>
                        <span className="text-sm">Back to Gallery</span>
                    </Link>
                    <h1 className="font-sans text-2xl font-medium tracking-tight text-foreground">
                        {shopData.name}
                    </h1>
                    <div className="w-24"/>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                {/* Shop Header */}
                <div className="mb-12 flex flex-col md:flex-row items-start gap-6">
                    <Image
                        src={
                            shopData.image
                                ? `/api/r2/images/${encodeURIComponent(shopData.image.url)}`
                                : primaryOwner?.image || "/placeholder.svg"
                        }
                        alt={shopData.name}
                        width={120}
                        height={120}
                        className="rounded-full"
                    />
                    <div className="flex-1">
                        <h2 className="font-sans text-4xl font-medium leading-tight tracking-tight text-foreground">
                            {shopData.name}
                        </h2>

                        {/* Owner Info */}
                        {primaryOwner && (
                            <div className="mt-4 space-y-2">
                                <p className="text-sm font-medium text-foreground">
                                    Owner: {primaryOwner.name}
                                </p>
                                <div className="flex flex-col gap-1 text-sm text-muted-foreground">

                                    {primaryOwner.phone && (
                                        <a
                                            href={`tel:${primaryOwner.phone}`}
                                            className="flex items-center gap-2 hover:text-foreground transition-colors"
                                        >
                                            <Phone className="h-4 w-4"/>
                                            {primaryOwner.phone}
                                        </a>
                                    )}
                                    {primaryOwner.address && (
                                        <p className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4"/>
                                            {primaryOwner.address}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mt-4 flex gap-3">
                            <span className="text-sm text-muted-foreground">
                                {shopData.productCount} {shopData.productCount === 1 ? 'product' : 'products'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3>Share</h3>

                        <EnhancedShareComponent
                            shopId={shopId}
                            shopName={shopData.name}
                            shopImage={shopData.image?.url}
                            productCount={shopData.productCount}
                            ownerName={primaryOwner?.name}
                            ownerAddress={primaryOwner?.address}
                            variant="modal" // or "buttons" for inline
                        />

                    </div>
                </div>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-lg text-muted-foreground">No products available</p>
                    </div>
                ) : (
                    <div
                        className={`columns-1 gap-4 space-y-4 transition-all duration-300 sm:columns-2 lg:columns-3 xl:columns-4 ${
                            selectedProduct ? "blur-sm" : ""
                        }`}
                    >
                        {products.map((product) => {
                            const height = getProductHeight(product._id);
                            const hasMultipleImages = product.images && product.images.length > 1;

                            return (
                                <button
                                    key={product._id}
                                    onClick={() => handleProductClick(product)}
                                    className="group relative block w-full break-inside-avoid overflow-hidden rounded-sm bg-card text-left transition-all hover:shadow-lg"
                                >
                                    <div className="relative" style={{height: `${height}px`}}>
                                        {/* Image ScrollArea - only show if multiple images */}
                                        {hasMultipleImages ? (
                                            <ScrollArea className="w-full">
                                                <div className="flex gap-0">
                                                    {product.images.map((image, idx) => (
                                                        <div key={image.url} className="relative flex-shrink-0 w-full">
                                                            <Image
                                                                src={`/api/r2/images/${encodeURIComponent(image.url)}`}
                                                                alt={`${product.name} - Image ${idx + 1}`}
                                                                width={300}
                                                                height={height}
                                                                className="w-full transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                            <div
                                                                className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/10"/>
                                                        </div>
                                                    ))}
                                                </div>
                                                <ScrollBar orientation="horizontal" className="h-2"/>
                                            </ScrollArea>
                                        ) : (

                                            <Image
                                                src={`/api/r2/images/${encodeURIComponent(product.images?.[0]?.url || "/placeholder.svg")}`}
                                                alt={product.name}
                                                width={300}
                                                height={height}
                                                className="w-full transition-transform duration-300 group-hover:scale-105"
                                            />

                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-sans text-sm font-medium text-foreground">
                                            {product.name}
                                        </h3>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            sh{product.price.toFixed(2)}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground/70">
                                            {product.category.name}
                                        </p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </main>

            {selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    )
}