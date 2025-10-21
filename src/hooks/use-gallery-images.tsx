"use client"

import { useState, useCallback } from "react"

export interface GalleryImage {
    _id: string
    label: string
    url: string
}

export function useGalleryImages() {
    const [images, setImages] = useState<GalleryImage[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>("")

    const fetchImages = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const response = await fetch("/api/images")
            const data = await response.json()
            if (data.success) {
                setImages(data.images)
            } else {
                setError(data.error || "Failed to fetch images")
            }
        } catch (err) {
            setError("Failed to fetch images")
            console.error("Error fetching images:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    const deleteImage = useCallback(
        async (imageId: string) => {
            // Optimistic update
            const previousImages = images
            setImages((prev) => prev.filter((img) => img._id !== imageId))

            try {
                const response = await fetch(`/api/images/${imageId}`, {
                    method: "DELETE",
                })
                const data = await response.json()

                if (data.success) {
                    setImages(data.images)
                } else {
                    // Revert on error
                    setImages(previousImages)
                    setError(data.error || "Failed to delete image")
                }
            } catch (err) {
                setImages(previousImages)
                setError("Failed to delete image")
                console.error("Delete error:", err)
            }
        },
        [images],
    )

    return {
        images,
        loading,
        error,
        setError,
        fetchImages,
        deleteImage,
        setImages,
    }
}
