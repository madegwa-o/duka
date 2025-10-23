"use client"

import { useState, memo } from "react"
import { X, Loader2 } from "lucide-react"
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
import Image from "next/image"
import type { GalleryImage } from "@/hooks/use-gallery-images"

interface CreateShopDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (name: string,whatsappGroupUrl: string, imageId?: string) => Promise<void>
    galleryImages: GalleryImage[]
    isLoading?: boolean
}

export const CreateShopDialog = memo(function CreateShopDialog({
                                                                   open,
                                                                   onOpenChange,
                                                                   onSubmit,
                                                                   galleryImages,
                                                                   isLoading = false,
                                                               }: CreateShopDialogProps) {
    const [shopName, setShopName] = useState("")
    const [whatsappGroupUrl, setWhatsappGroupUrl] = useState('')
    const [selectedImage, setSelectedImage] = useState<string>("")
    const [showImageSelector, setShowImageSelector] = useState(false)

    const handleSubmit = async () => {
        if (!shopName.trim() ) return

        if (whatsappGroupUrl) {
            await onSubmit(shopName, whatsappGroupUrl, selectedImage || undefined)
        }
        await onSubmit(shopName, '', selectedImage || undefined)
        setShopName("")
        setWhatsappGroupUrl('')
        setSelectedImage("")
        onOpenChange(false)
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Shop</DialogTitle>
                        <DialogDescription>Enter shop details and select an image from your gallery</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="shopName">Shop Name *</Label>
                            <Input
                                id="shopName"
                                placeholder="My Awesome Shop"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <Label htmlFor="whatsappGroupUrl">whatsapp Group Link(optional)</Label>
                            <Input
                                id="whatsappGroupUrl"
                                placeholder=" https://chat.whatsapp.com/GFcqeFcihf0Bqpe5Phau"
                                value={whatsappGroupUrl}
                                onChange={(e) => setWhatsappGroupUrl(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <Label>Shop Image (Optional)</Label>
                            <Button
                                variant="outline"
                                className="w-full mt-2 bg-transparent"
                                onClick={() => setShowImageSelector(true)}
                                disabled={isLoading}
                            >
                                {selectedImage ? "Change Image" : "Select from Gallery"}
                            </Button>
                            {selectedImage && (
                                <div className="mt-2 relative">
                                    <Image
                                        src={`/api/r2/images/${encodeURIComponent(
                                            galleryImages.find((i) => i._id === selectedImage)?.url || "",
                                        )}`}
                                        alt="Selected"
                                        width={400}
                                        height={128}
                                        className="w-full h-32 object-cover rounded"
                                    />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-2 right-2"
                                        onClick={() => setSelectedImage("")}
                                        disabled={isLoading}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isLoading || !shopName.trim()}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Shop"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Selector Modal */}
            <Dialog open={showImageSelector} onOpenChange={setShowImageSelector}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Select Shop Image</DialogTitle>
                        <DialogDescription>Choose one image for your shop</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {galleryImages.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No images in gallery. Upload some images first!
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                                {galleryImages.map((img) => (
                                    <div
                                        key={img._id}
                                        className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                                            selectedImage === img._id
                                                ? "border-primary ring-2 ring-primary"
                                                : "border-border hover:border-primary/50"
                                        }`}
                                        onClick={() => {
                                            setSelectedImage(img._id)
                                            setShowImageSelector(false)
                                        }}
                                    >
                                        <Image
                                            src={`/api/r2/images/${encodeURIComponent(img.url)}`}
                                            alt={img.label}
                                            width={100}
                                            height={80}
                                            className="w-full h-20 object-cover"
                                        />
                                        <div className="p-2 bg-background">
                                            <p className="text-xs truncate">{img.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
})
