"use client"

import React, { useEffect, useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUploader } from "@/components/image-uploader"
import { ImageGallery } from "@/components/image-gallery"
import { ShopList } from "@/components/shop-list"
import { ProductList } from "@/components/product-list"
import { CreateShopDialog } from "@/components/create-shop-dialog"
import { CreateProductDialog } from "@/components/create-product-dialog"
import { useGalleryImages } from "@/hooks/use-gallery-images"
import { useShops } from "@/hooks/use-shops"
import { useProducts } from "@/hooks/use-products"
import { useCategories } from "@/hooks/use-categories"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

export default function ShopProductManager() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const galleryImages = useGalleryImages()
    const shops = useShops()
    const products = useProducts()
    const categories = useCategories()

    // Dialog states
    const [shopDialogOpen, setShopDialogOpen] = useState(false)
    const [productDialogOpen, setProductDialogOpen] = useState(false)
    const [creatingShop, setCreatingShop] = useState(false)
    const [creatingProduct, setCreatingProduct] = useState(false)

    const [globalError, setGlobalError] = useState<string>("")

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(`/signin?callbackUrl=${encodeURIComponent("/my-shop")}`)
        }
    }, [status, router])

    useEffect(() => {
        if (session?.user && status === "authenticated") {
            galleryImages.fetchImages()
            shops.fetchShops()
            products.fetchProducts()
            categories.fetchCategories()
        }
    }, [session, status])

    const handleImageSaved = () => {
        galleryImages.fetchImages()
    }

    const handleImageError = (error: string) => {
        setGlobalError(error)
    }

    const handleCreateShop = async (name: string, whatsappGroupUrl:string, imageId?: string) => {
        setCreatingShop(true)
        const result = await shops.createShop(name, whatsappGroupUrl, imageId)
        setCreatingShop(false)

        if (!result.success) {
            setGlobalError(result.error || "Failed to create shop")
        }
    }

    const handleCreateProduct = async (data: {
        name: string
        description: string
        price: number
        shop: string
        categorySlug: string
        images: string[]
    }) => {
        setCreatingProduct(true)
        const result = await products.createProduct(data)
        setCreatingProduct(false)

        if (!result.success) {
            setGlobalError(result.error || "Failed to create product")
        } else if (result.categoryCreated) {
            categories.fetchCategories()
        }
    }

    // Show loading state while checking authentication
    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Don't render anything if not authenticated (will redirect)
    if (!session) return null

    return (
        <main className="container px-4 py-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="font-bold text-3xl mb-2">Shop & Product Manager</h1>
                <p className="text-muted-foreground">Manage your image gallery, shops, and products.</p>
            </div>

            {globalError && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{globalError}</AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="gallery" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="gallery">Gallery</TabsTrigger>
                    <TabsTrigger value="shops">Shops</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                </TabsList>


                <TabsContent value="gallery" className="space-y-6">
                    {/* Image Upload & Gallery Section */}
                    <div className="grid gap-6 lg:grid-cols-3 mb-6">
                        <ImageUploader onImageSaved={handleImageSaved} onError={handleImageError} />
                        <ImageGallery images={galleryImages.images} onDelete={galleryImages.deleteImage} />
                    </div>
                </TabsContent>

                <TabsContent value="shops" className="space-y-6">

                    {/* Shops Section */}
                    <ShopList shops={shops.shops} onCreateClick={() => setShopDialogOpen(true)} />


                    {/* Dialogs */}
                    <CreateShopDialog
                        open={shopDialogOpen}
                        onOpenChange={setShopDialogOpen}
                        onSubmit={handleCreateShop}
                        galleryImages={galleryImages.images}
                        isLoading={creatingShop}
                    />

                </TabsContent>
                <TabsContent value="products" className="space-y-6">

                    {/* Products Section */}
                    <div className="mt-6">
                        <ProductList products={products.products} onCreateClick={() => setProductDialogOpen(true)} />
                    </div>

                    <CreateProductDialog
                        open={productDialogOpen}
                        onOpenChange={setProductDialogOpen}
                        onSubmit={handleCreateProduct}
                        shops={shops.shops}
                        galleryImages={galleryImages.images}
                        categories={categories.categories}
                        isLoading={creatingProduct}
                    />
                </TabsContent>

            </Tabs>


        </main>
    )
}
