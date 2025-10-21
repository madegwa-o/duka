"use client"

import { useState, useEffect } from "react"
import {
    Upload,
    X,
    Loader2,
    AlertCircle as ImageIcon,
    Save,
    Trash2,
    Store,
    Package,
    Plus,
    AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {useRouter} from "next/navigation"
import {useSession} from "next-auth/react"
import Image from "next/image"


interface GalleryImage {
    _id: string
    label: string
    url: string
}

interface Shop {
    _id: string
    name: string
    image?: GalleryImage
}

interface Product {
    _id: string
    name: string
    price: number
    shop: Shop
    images: GalleryImage[]
    category: {
        _id: string
        name: string
    }
}

interface Category {
    _id: string
    name: string
    slug: string
}

export default function ShopProductManager() {
    const { data: session, status } = useSession()
    const router = useRouter()

    // Image Upload States
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>("")
    const [uploadedFilename, setUploadedFilename] = useState<string>("")
    const [imageLabel, setImageLabel] = useState<string>("")
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)

    // Gallery States
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
    const [selectedImageForView, setSelectedImageForView] = useState<GalleryImage | null>(null)

    // Shop States
    const [shops, setShops] = useState<Shop[]>([])
    const [shopDialogOpen, setShopDialogOpen] = useState(false)
    const [shopName, setShopName] = useState("")
    const [selectedShopImage, setSelectedShopImage] = useState<string>("")
    const [creatingShop, setCreatingShop] = useState(false)

    // Product States
    const [products, setProducts] = useState<Product[]>([])
    const [productDialogOpen, setProductDialogOpen] = useState(false)
    const [productName, setProductName] = useState("")
    const [productPrice, setProductPrice] = useState("")
    const [productShop, setProductShop] = useState("")
    const [productCategory, setProductCategory] = useState("")

    // Category filtering states
    const [categoryInput, setCategoryInput] = useState("")
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
    const [selectedProductImages, setSelectedProductImages] = useState<string[]>([])
    const [creatingProduct, setCreatingProduct] = useState(false)

    // Category States
    const [categories, setCategories] = useState<Category[]>([])
    const [loadingCategories, setLoadingCategories] = useState(false)

    // Image Selection Dialog
    const [imageSelectionOpen, setImageSelectionOpen] = useState(false)
    const [imageSelectionMode, setImageSelectionMode] = useState<'shop' | 'product'>('shop')

    const [error, setError] = useState<string>("")

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(`/signin?callbackUrl=${encodeURIComponent("/my-shop")}`)
        }
    }, [status, router])

    useEffect(() => {
        if (session?.user && status === "authenticated") {
            fetchGalleryImages()
            fetchShops()
            fetchProducts()
            fetchCategories()
        }
    }, [session, status])

    // Filter categories based on input
    useEffect(() => {
        if (categoryInput.trim()) {
            const filtered = categories.filter(cat =>
                cat.slug.toLowerCase().includes(categoryInput.toLowerCase()) ||
                cat.name.toLowerCase().includes(categoryInput.toLowerCase())
            )
            setFilteredCategories(filtered)
        } else {
            setFilteredCategories(categories)
        }
    }, [categoryInput, categories])

    const fetchCategories = async () => {
        setLoadingCategories(true)
        try {
            const response = await fetch("/api/categories")
            const data = await response.json()
            if (data.success) {
                setCategories(data.categories)
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
        } finally {
            setLoadingCategories(false)
        }
    }

    const fetchGalleryImages = async () => {
        try {
            const response = await fetch("/api/images")
            const data = await response.json()
            if (data.success) {
                setGalleryImages(data.images)
            }
        } catch (error) {
            console.error("Error fetching images:", error)
        }
    }

    const fetchShops = async () => {
        try {
            const response = await fetch("/api/shops")
            const data = await response.json()
            if (data.success) {
                setShops(data.shops)
            }
        } catch (error) {
            console.error("Error fetching shops:", error)
        }
    }

    const fetchProducts = async () => {
        try {
            const response = await fetch("/api/products")
            const data = await response.json()
            if (data.success) {
                setProducts(data.products)
            }
        } catch (error) {
            console.error("Error fetching products:", error)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB")
            return
        }

        if (!selectedFile.type.startsWith("image/")) {
            setError("Please upload a valid image file")
            return
        }

        setFile(selectedFile)
        const url = URL.createObjectURL(selectedFile)
        setPreviewUrl(url)
        setError("")
    }

    const handleUpload = async () => {
        if (!file) return

        setUploading(true)
        setError("")
        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch("/api/r2/upload", {
                method: "POST",
                body: formData,
            })

            const data = await response.json()

            if (data.success) {
                setUploadedFilename(data.filename)
                setPreviewUrl(data.previewUrl)
            } else {
                setError(data.error || "Upload failed")
            }
        } catch (error) {
            console.error("Upload error:", error)
            setError("Upload failed. Please try again.")
        } finally {
            setUploading(false)
        }
    }

    const handleSaveToGallery = async () => {
        if (!uploadedFilename || !imageLabel.trim()) {
            setError("Please upload an image and provide a label")
            return
        }

        setSaving(true)
        setError("")

        try {
            const response = await fetch("/api/images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    label: imageLabel.trim(),
                    url: uploadedFilename,
                }),
            })

            const data = await response.json()

            if (data.success) {
                setGalleryImages(data.images)
                setFile(null)
                setPreviewUrl("")
                setUploadedFilename("")
                setImageLabel("")
            } else {
                setError(data.error || "Failed to save image")
            }
        } catch (error) {
            console.error("Save error:", error)
            setError("Failed to save image. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteImage = async (imageId: string) => {
        try {
            const response = await fetch(`/api/images/${imageId}`, {
                method: "DELETE",
            })

            const data = await response.json()

            if (data.success) {
                setGalleryImages(data.images)
                if (selectedImageForView?._id === imageId) {
                    setSelectedImageForView(null)
                }
            }
        } catch (error) {
            console.error("Delete error:", error)
            setError("Failed to delete image")
        }
    }

    const handleCreateShop = async () => {
        if (!shopName.trim()) {
            setError("Please enter a shop name")
            return
        }

        setCreatingShop(true)
        setError("")

        try {
            const response = await fetch("/api/shops", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: shopName.trim(),
                    image: selectedShopImage || undefined,
                }),
            })

            const data = await response.json()

            if (data.success) {
                setShops(data.shops)
                setShopDialogOpen(false)
                setShopName("")
                setSelectedShopImage("")
            } else {
                setError(data.error || "Failed to create shop")
            }
        } catch (error) {
            console.error("Create shop error:", error)
            setError("Failed to create shop. Please try again.")
        } finally {
            setCreatingShop(false)
        }
    }

    const handleCreateProduct = async () => {
        if (!productName.trim() || !productPrice || !productShop || !categoryInput.trim()) {
            setError("Please fill in all required fields")
            return
        }

        setCreatingProduct(true)
        setError("")

        try {
            const response = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: productName.trim(),
                    price: parseFloat(productPrice),
                    shop: productShop,
                    categorySlug: categoryInput.trim().toLowerCase().replace(/\s+/g, '-'),
                    images: selectedProductImages,
                }),
            })

            const data = await response.json()

            if (data.success) {
                setProducts(data.products)
                setProductDialogOpen(false)
                setProductName("")
                setProductPrice("")
                setProductShop("")
                setProductCategory("")
                setCategoryInput("")
                setSelectedProductImages([])
                if (data.categoryCreated) {
                    fetchCategories()
                }
            } else {
                setError(data.error || "Failed to create product")
            }
        } catch (error) {
            console.error("Create product error:", error)
            setError("Failed to create product. Please try again.")
        } finally {
            setCreatingProduct(false)
        }
    }

    const openImageSelection = (mode: 'shop' | 'product') => {
        setImageSelectionMode(mode)
        setImageSelectionOpen(true)
    }

    const handleSelectImage = (imageId: string) => {
        if (imageSelectionMode === 'shop') {
            setSelectedShopImage(imageId)
            setImageSelectionOpen(false)
        } else {
            if (selectedProductImages.includes(imageId)) {
                setSelectedProductImages(selectedProductImages.filter(id => id !== imageId))
            } else {
                setSelectedProductImages([...selectedProductImages, imageId])
            }
        }
    }

    const handleClear = () => {
        setFile(null)
        setPreviewUrl("")
        setUploadedFilename("")
        setImageLabel("")
        setError("")
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

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Image Upload Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            Upload Images
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!previewUrl ? (
                            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                                <div className="flex flex-col items-center justify-center gap-2 text-center p-4">
                                    <Upload className="h-10 w-10 text-muted-foreground" />
                                    <p className="font-medium text-sm">Click to upload</p>
                                    <p className="text-muted-foreground text-xs">PNG, JPG up to 5MB</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={handleClear}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {!uploadedFilename ? (
                                    <Button className="w-full" onClick={handleUpload} disabled={uploading}>
                                        {uploading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload to Cloud
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <div className="space-y-3">
                                        <div>
                                            <Label htmlFor="imageLabel">Image Label</Label>
                                            <Input
                                                id="imageLabel"
                                                placeholder="e.g., Product Photo"
                                                value={imageLabel}
                                                onChange={(e) => setImageLabel(e.target.value)}
                                            />
                                        </div>
                                        <Button className="w-full" onClick={handleSaveToGallery} disabled={saving}>
                                            {saving ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Save to Gallery
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Image Gallery */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" />
                            Image Gallery ({galleryImages.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {galleryImages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center">
                                <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                                <p className="text-muted-foreground text-sm">No images yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
                                {galleryImages.map((img) => (
                                    <div
                                        key={img._id}
                                        className="relative group border rounded-lg overflow-hidden hover:border-primary transition-colors"
                                    >
                                        <Image
                                            src={`/api/r2/images/${encodeURIComponent(img.url)}`}
                                            alt={img.label}
                                            className="w-full h-32 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => handleDeleteImage(img._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="p-2 bg-background">
                                            <p className="text-xs truncate">{img.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full" onClick={() => setShopDialogOpen(true)}>
                            <Store className="mr-2 h-4 w-4" />
                            Create New Shop
                        </Button>
                        <Button className="w-full" variant="outline" onClick={() => setProductDialogOpen(true)}>
                            <Package className="mr-2 h-4 w-4" />
                            Create New Product
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Shops Section */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        My Shops ({shops.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {shops.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No shops yet. Create your first shop!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {shops.map((shop) => (
                                <div key={shop._id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                                    {shop.image && (
                                        <Image
                                            src={`/api/r2/images/${encodeURIComponent(shop.image.url)}`}
                                            alt={shop.name}
                                            className="w-full h-32 object-cover rounded-lg mb-3"
                                        />
                                    )}
                                    <h3 className="font-semibold">{shop.name}</h3>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Products Section */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        My Products ({products.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {products.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No products yet. Create your first product!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {products.map((product) => (
                                <div
                                    key={product._id}
                                    className="border rounded-lg p-4 hover:border-primary transition-colors"
                                >
                                    {product.images.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            {product.images.map((img, idx) => (
                                                <Image
                                                    key={idx}
                                                    src={`/api/r2/images/${encodeURIComponent(img.url)}`}
                                                    alt={img.label || product.name}
                                                    className="w-full h-24 object-cover rounded"
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">{product.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {product.category?.name || "No category"}
                                            </p>
                                            <p className="text-lg font-bold text-primary mt-2">
                                                sh{product.price}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm text-muted-foreground">{product.shop.name}</h3>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Shop Dialog */}
            <Dialog open={shopDialogOpen} onOpenChange={setShopDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Shop</DialogTitle>
                        <DialogDescription>
                            Enter shop details and select an image from your gallery
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="shopName">Shop Name *</Label>
                            <Input
                                id="shopName"
                                placeholder="My Awesome Shop"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Shop Image (Optional)</Label>
                            <Button
                                variant="outline"
                                className="w-full mt-2"
                                onClick={() => openImageSelection('shop')}
                            >
                                {selectedShopImage ? "Change Image" : "Select from Gallery"}
                            </Button>
                            {selectedShopImage && (
                                <div className="mt-2 relative">
                                    <Image
                                        src={`/api/r2/images/${encodeURIComponent(galleryImages.find(i => i._id === selectedShopImage)?.url || '')}`}
                                        alt="Selected"
                                        className="w-full h-32 object-cover rounded"
                                    />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-2 right-2"
                                        onClick={() => setSelectedShopImage("")}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShopDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateShop} disabled={creatingShop}>
                            {creatingShop ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Create Shop
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Product Dialog */}
            <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Product</DialogTitle>
                        <DialogDescription>
                            Enter product details and select images from your gallery
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="productName">Product Name *</Label>
                            <Input
                                id="productName"
                                placeholder="Amazing Product"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="productPrice">Price *</Label>
                            <Input
                                id="productPrice"
                                type="number"
                                step="0.01"
                                placeholder="29.99"
                                value={productPrice}
                                onChange={(e) => setProductPrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="productShop">Shop *</Label>
                            <Select value={productShop} onValueChange={setProductShop}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a shop" />
                                </SelectTrigger>
                                <SelectContent>
                                    {shops.map((shop) => (
                                        <SelectItem key={shop._id} value={shop._id}>
                                            {shop.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="productCategory">Category *</Label>
                            <div className="relative">
                                <Input
                                    id="productCategory"
                                    placeholder="Type to search or create new category..."
                                    value={categoryInput}
                                    onChange={(e) => {
                                        setCategoryInput(e.target.value)
                                        setShowCategoryDropdown(true)
                                    }}
                                    onFocus={() => setShowCategoryDropdown(true)}
                                    onBlur={() => {
                                        setTimeout(() => setShowCategoryDropdown(false), 200)
                                    }}
                                    autoComplete="off"
                                />
                                {showCategoryDropdown && categoryInput && (
                                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                                        {filteredCategories.length > 0 ? (
                                            <>
                                                {filteredCategories.map((category) => (
                                                    <div
                                                        key={category._id}
                                                        className="px-3 py-2 cursor-pointer hover:bg-accent transition-colors"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault()
                                                            setCategoryInput(category.slug)
                                                            setProductCategory(category._id)
                                                            setShowCategoryDropdown(false)
                                                        }}
                                                    >
                                                        <div className="font-medium">{category.name}</div>
                                                        <div className="text-xs text-muted-foreground">{category.slug}</div>
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <div className="px-3 py-2 text-sm">
                                                <div className="flex items-center gap-2 text-primary">
                                                    <Plus className="h-4 w-4" />
                                                    <span>Create new category: <strong>{categoryInput}</strong></span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    This will be created automatically
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Type to search existing categories or create a new one
                            </p>
                        </div>

                        <div>
                            <Label>Product Images ({selectedProductImages.length} selected)</Label>
                            <Button
                                variant="outline"
                                className="w-full mt-2"
                                onClick={() => openImageSelection('product')}
                            >
                                Select Images from Gallery
                            </Button>
                            {selectedProductImages.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {selectedProductImages.map((imgId) => {
                                        const img = galleryImages.find(i => i._id === imgId)
                                        return img ? (
                                            <div key={imgId} className="relative">
                                                <Image
                                                    src={`/api/r2/images/${encodeURIComponent(img.url)}`}
                                                    alt={img.label}
                                                    className="w-full h-20 object-cover rounded"
                                                />
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    className="absolute -top-2 -right-2 h-6 w-6"
                                                    onClick={() => setSelectedProductImages(selectedProductImages.filter(id => id !== imgId))}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ) : null
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateProduct} disabled={creatingProduct}>
                            {creatingProduct ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Create Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Selection Dialog */}
            <Dialog open={imageSelectionOpen} onOpenChange={setImageSelectionOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            {imageSelectionMode === 'shop' ? 'Select Shop Image' : 'Select Product Images'}
                        </DialogTitle>
                        <DialogDescription>
                            {imageSelectionMode === 'shop'
                                ? 'Choose one image for your shop'
                                : 'Choose multiple images for your product'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {galleryImages.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No images in gallery. Upload some images first!
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                                {galleryImages.map((img) => {
                                    const isSelected = imageSelectionMode === 'shop'
                                        ? selectedShopImage === img._id
                                        : selectedProductImages.includes(img._id)

                                    return (
                                        <div
                                            key={img._id}
                                            className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                                                isSelected ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-primary/50'
                                            }`}
                                            onClick={() => handleSelectImage(img._id)}
                                        >
                                            <img
                                                src={`/api/r2/images/${encodeURIComponent(img.url)}`}
                                                alt={img.label}
                                                className="w-full h-24 object-cover"
                                            />
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="p-2 bg-background">
                                                <p className="text-xs truncate">{img.label}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setImageSelectionOpen(false)}>
                            {imageSelectionMode === 'product' && selectedProductImages.length > 0
                                ? `Done (${selectedProductImages.length} selected)`
                                : 'Close'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    )
}