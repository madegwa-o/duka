"use client"

import { useState, memo, useMemo } from "react"
import { X, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import type { GalleryImage } from "@/hooks/use-gallery-images"
import type { Shop } from "@/hooks/use-shops"
import type { Category } from "@/hooks/use-categories"

interface CreateProductDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: {
        name: string
        description: string
        price: number
        shop: string
        categorySlug: string
        images: string[]
    }) => Promise<void>
    shops: Shop[]
    galleryImages: GalleryImage[]
    categories: Category[]
    isLoading?: boolean
}

export const CreateProductDialog = memo(function CreateProductDialog({
                                                                         open,
                                                                         onOpenChange,
                                                                         onSubmit,
                                                                         shops,
                                                                         galleryImages,
                                                                         categories,
                                                                         isLoading = false,
                                                                     }: CreateProductDialogProps) {
    const [productName, setProductName] = useState("")
    const [productDescription, setProductDescription] = useState("")
    const [productPrice, setProductPrice] = useState("")
    const [productShop, setProductShop] = useState("")
    const [categoryInput, setCategoryInput] = useState("")
    const [selectedImages, setSelectedImages] = useState<string[]>([])
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
    const [showImageSelector, setShowImageSelector] = useState(false)

    const filteredCategories = useMemo(() => {
        if (!categoryInput.trim()) return categories
        const lowerInput = categoryInput.toLowerCase()
        return categories.filter(
            (cat) => cat.slug.toLowerCase().includes(lowerInput) || cat.name.toLowerCase().includes(lowerInput),
        )
    }, [categoryInput, categories])

    const handleSubmit = async () => {
        if (!productName.trim() || !productPrice || !productShop || !categoryInput.trim()) {
            return
        }

        await onSubmit({
            name: productName.trim(),
            description: productDescription.trim(),
            price: Number.parseFloat(productPrice),
            shop: productShop,
            categorySlug: categoryInput.trim().toLowerCase().replace(/\s+/g, "-"),
            images: selectedImages,
        })

        // Reset form
        setProductName("")
        setProductDescription("")
        setProductPrice("")
        setProductShop("")
        setCategoryInput("")
        setSelectedImages([])
        onOpenChange(false)
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Product</DialogTitle>
                        <DialogDescription>Enter product details and select images from your gallery</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div>
                            <Label htmlFor="productName">Product Name *</Label>
                            <Input
                                id="productName"
                                placeholder="Amazing Product"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <Label htmlFor="productDescription">Description</Label>
                            <Input
                                id="productDescription"
                                placeholder="Brand New Kitchen Table"
                                value={productDescription}
                                onChange={(e) => setProductDescription(e.target.value)}
                                disabled={isLoading}
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
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <Label htmlFor="productShop">Shop *</Label>
                            <Select value={productShop} onValueChange={setProductShop} disabled={isLoading}>
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
                                    disabled={isLoading}
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
                                                    <span>
                            Create new: <strong>{categoryInput}</strong>
                          </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">This will be created automatically</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label>Product Images ({selectedImages.length} selected)</Label>
                            <Button
                                variant="outline"
                                className="w-full mt-2 bg-transparent"
                                onClick={() => setShowImageSelector(true)}
                                disabled={isLoading}
                            >
                                Select Images from Gallery
                            </Button>
                            {selectedImages.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {selectedImages.map((imgId) => {
                                        const img = galleryImages.find((i) => i._id === imgId)
                                        return img ? (
                                            <div key={imgId} className="relative">
                                                <Image
                                                    src={`/api/r2/images/${encodeURIComponent(img.url)}`}
                                                    alt={img.label}
                                                    width={100}
                                                    height={80}
                                                    className="w-full h-20 object-cover rounded"
                                                />
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    className="absolute -top-2 -right-2 h-6 w-6"
                                                    onClick={() => setSelectedImages(selectedImages.filter((id) => id !== imgId))}
                                                    disabled={isLoading}
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
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || !productName.trim() || !productPrice || !productShop || !categoryInput.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Product"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Selector Modal */}
            <Dialog open={showImageSelector} onOpenChange={setShowImageSelector}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Select Product Images</DialogTitle>
                        <DialogDescription>Choose multiple images for your product</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {galleryImages.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No images in gallery. Upload some images first!
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                                {galleryImages.map((img) => {
                                    const isSelected = selectedImages.includes(img._id)
                                    return (
                                        <div
                                            key={img._id}
                                            className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                                                isSelected ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"
                                            }`}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedImages(selectedImages.filter((id) => id !== img._id))
                                                } else {
                                                    setSelectedImages([...selectedImages, img._id])
                                                }
                                            }}
                                        >
                                            <Image
                                                src={`/api/r2/images/${encodeURIComponent(img.url)}`}
                                                alt={img.label}
                                                width={100}
                                                height={80}
                                                className="w-full h-20 object-cover"
                                            />
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
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
                        <Button variant="outline" onClick={() => setShowImageSelector(false)}>
                            {selectedImages.length > 0 ? `Done (${selectedImages.length} selected)` : "Close"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
})
