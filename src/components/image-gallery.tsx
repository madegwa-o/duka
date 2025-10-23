"use client"

import { memo } from "react"
import { Trash2, CameraIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import type { GalleryImage } from "@/hooks/use-gallery-images"

interface ImageGalleryProps {
    images: GalleryImage[]
    onDelete: (imageId: string) => void
    onSelectImage?: (imageId: string) => void
    selectable?: boolean
    selectedIds?: string[]
    multiSelect?: boolean
}

export const ImageGallery = memo(function ImageGallery({
                                                           images,
                                                           onDelete,
                                                           onSelectImage,
                                                           selectable = false,
                                                           selectedIds = [],
                                                           multiSelect = false,
                                                       }: ImageGalleryProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <span>Image Gallery ({images.length})</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                        <div className="relative w-32 h-32 mb-4">
                            <Image
                                src="/logo.png"
                                alt="Duka"
                                fill
                                className="object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
                                priority
                            />
                        </div>
                        <p className="text-muted-foreground mb-4 text-sm">No Images yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
                        {images.map((img) => {
                            const isSelected = selectedIds.includes(img._id)
                            return (
                                <div
                                    key={img._id}
                                    className={`relative group border rounded-lg overflow-hidden transition-all cursor-pointer ${
                                        selectable
                                            ? isSelected
                                                ? "border-primary ring-2 ring-primary"
                                                : "border-border hover:border-primary/50"
                                            : "hover:border-primary"
                                    }`}
                                    onClick={() => selectable && onSelectImage?.(img._id)}
                                >
                                    <Image
                                        src={`/api/r2/images/${encodeURIComponent(img.url)}`}
                                        alt={img.label}
                                        width={200}
                                        height={128}
                                        className="w-full h-32 object-cover"
                                    />

                                    {/* Selection indicator */}
                                    {selectable && isSelected && (
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

                                    {/* Delete button */}
                                    {!selectable && (
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button size="icon" variant="destructive" onClick={() => onDelete(img._id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
            </CardContent>
        </Card>
    )
})
