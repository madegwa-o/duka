"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getProductsByShop, getProductById, shops, type Product } from "@/lib/data"
import { ProductDetailModal } from "@/components/product-detail-modal"
import { ArrowLeft } from "lucide-react"

export default function ShopPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const shopId = params.shopId as string

    const productIdParam = searchParams.get("product")

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [products, setProducts] = useState<Product[]>([])

    const merchant = shops[shopId]



    useEffect(() => {

        console.log('shopId ', shopId)
    }, [shopId]);

    useEffect(() => {

        console.log('merchant', merchant)
    }, [merchant]);

    useEffect(() => {
        const merchantProducts = getProductsByShop(shopId)

        if (merchantProducts ){
            console.log('merchantProducts exist: ', merchantProducts)
        }else {
            console.log('merchant products dont exist: ')
        }
        setProducts(merchantProducts)

        if (productIdParam) {
            const product = getProductById(Number(productIdParam))
            if (product) {
                setSelectedProduct(product)
            }
        }
    }, [shopId, productIdParam])

    const handleCloseModal = () => {
        setSelectedProduct(null)
        router.push(`/shop/${shopId}`, { scroll: false })
    }

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product)
        router.push(`/shop/${shopId}?product=${product.id}`, { scroll: false })
    }

    if (!merchant) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">Merchant not found</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm">Back to Gallery</span>
                    </Link>
                    <h1 className="font-sans text-2xl font-medium tracking-tight text-foreground">Karu Main</h1>
                    <div className="w-24" />
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="mb-12 flex items-start gap-6">
                    <Image
                        src={merchant.avatar || "/placeholder.svg"}
                        alt={merchant.name}
                        width={100}
                        height={100}
                        className="rounded-full"
                    />
                    <div className="flex-1">
                        <h2 className="font-sans text-4xl font-medium leading-tight tracking-tight text-foreground">
                            {merchant.name}
                        </h2>
                        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{merchant.bio}</p>
                        <div className="mt-4 flex gap-3">
                            <span className="text-sm text-muted-foreground">{products.length} artworks</span>
                        </div>
                    </div>
                </div>

                <div
                    className={`columns-1 gap-4 space-y-4 transition-all duration-300 sm:columns-2 lg:columns-3 xl:columns-4 ${
                        selectedProduct ? "blur-sm" : ""
                    }`}
                >
                    {products.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => handleProductClick(product)}
                            className="group relative block w-full break-inside-avoid overflow-hidden rounded-sm bg-card text-left transition-all hover:shadow-lg"
                        >
                            <div className="relative">
                                <Image
                                    src={product.imageUrl || "/placeholder.svg"}
                                    alt={product.title}
                                    width={300}
                                    height={product.height}
                                    className="w-full transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/10" />
                            </div>
                            <div className="p-4">
                                <h3 className="font-sans text-sm font-medium text-foreground">{product.title}</h3>
                                <p className="mt-1 text-xs text-muted-foreground">${product.price}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </main>

            {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={handleCloseModal} />}
        </div>
    )
}
