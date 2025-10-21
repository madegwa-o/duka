"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

interface ImageUploaderProps {
    onImageSaved?: () => void
    onError?: (error: string) => void
}

export function ImageUploader({ onImageSaved, onError }: ImageUploaderProps) {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>("")
    const [uploadedFilename, setUploadedFilename] = useState<string>("")
    const [imageLabel, setImageLabel] = useState<string>("")
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        if (selectedFile.size > 5 * 1024 * 1024) {
            onError?.("Image size must be less than 5MB")
            return
        }

        if (!selectedFile.type.startsWith("image/")) {
            onError?.("Please upload a valid image file")
            return
        }

        setFile(selectedFile)
        const url = URL.createObjectURL(selectedFile)
        setPreviewUrl(url)
    }

    const handleUpload = async () => {
        if (!file) return

        setUploading(true)
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
                onError?.(data.error || "Upload failed")
            }
        } catch (error) {
            console.error("Upload error:", error)
            onError?.("Upload failed. Please try again.")
        } finally {
            setUploading(false)
        }
    }

    const handleSaveToGallery = async () => {
        if (!uploadedFilename || !imageLabel.trim()) {
            onError?.("Please upload an image and provide a label")
            return
        }

        setSaving(true)

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
                // Reset form
                setFile(null)
                setPreviewUrl("")
                setUploadedFilename("")
                setImageLabel("")
                onImageSaved?.()
            } else {
                onError?.(data.error || "Failed to save image")
            }
        } catch (error) {
            console.error("Save error:", error)
            onError?.("Failed to save image. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const handleClear = () => {
        setFile(null)
        setPreviewUrl("")
        setUploadedFilename("")
        setImageLabel("")
    }

    return (
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
                                width={400}
                                height={192}
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
    )
}
