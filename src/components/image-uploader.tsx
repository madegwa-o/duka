"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, Loader2, AlertCircle, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { parseError } from "@/lib/error-handler"
import { LabelInputDialog } from "./label-input-dialog"

interface ImageUploaderProps {
    onImageSaved?: () => void
    onError?: (error: string) => void
}

export function ImageUploader({ onImageSaved, onError }: ImageUploaderProps) {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>("")
    const [uploadedFilename, setUploadedFilename] = useState<string>("")
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string>("")
    const [labelDialogOpen, setLabelDialogOpen] = useState(false)
    const [labelError, setLabelError] = useState<string>("")
    const { isOnline, wasOffline } = useNetworkStatus()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        setError("")
        setLabelError("")

        if (selectedFile.size > 5 * 1024 * 1024) {
            const errorMsg = "Image size must be less than 5MB"
            setError(errorMsg)
            onError?.(errorMsg)
            return
        }

        if (!selectedFile.type.startsWith("image/")) {
            const errorMsg = "Please upload a valid image file (PNG, JPG, etc.)"
            setError(errorMsg)
            onError?.(errorMsg)
            return
        }

        setFile(selectedFile)
        const url = URL.createObjectURL(selectedFile)
        setPreviewUrl(url)
    }

    const handleUpload = async () => {
        if (!file) return

        if (!isOnline) {
            const errorMsg = "You are offline. Please check your internet connection."
            setError(errorMsg)
            onError?.(errorMsg)
            return
        }

        setUploading(true)
        setError("")
        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch("/api/r2/upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error(`Upload failed with status ${response.status}`)
            }

            const data = await response.json()

            if (data.success) {
                setUploadedFilename(data.filename)
                setLabelDialogOpen(true)
            } else {
                const errorMsg = data.error || "Upload failed"
                setError(errorMsg)
                onError?.(errorMsg)
            }
        } catch (err) {
            const errorInfo = parseError(err, isOnline)
            setError(errorInfo.message)
            onError?.(errorInfo.message)
            console.error("Upload error:", err)
        } finally {
            setUploading(false)
        }
    }

    const handleSaveLabel = async (label: string) => {
        if (!uploadedFilename) {
            const errorMsg = "Upload failed. Please try again."
            setLabelError(errorMsg)
            return
        }

        setSaving(true)
        setLabelError("")

        try {
            const response = await fetch("/api/images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    label: label.trim(),
                    url: uploadedFilename,
                }),
            })

            if (!response.ok) {
                throw new Error(`Save failed with status ${response.status}`)
            }

            const data = await response.json()

            if (data.success) {
                setFile(null)
                setPreviewUrl("")
                setUploadedFilename("")
                setLabelDialogOpen(false)
                onImageSaved?.()
            } else {
                const errorMsg = data.error || "Failed to save image"
                setLabelError(errorMsg)
                onError?.(errorMsg)
            }
        } catch (err) {
            const errorInfo = parseError(err, isOnline)
            setLabelError(errorInfo.message)
            onError?.(errorInfo.message)
            console.error("Save error:", err)
        } finally {
            setSaving(false)
        }
    }

    const handleClear = () => {
        setFile(null)
        setPreviewUrl("")
        setUploadedFilename("")
        setError("")
        setLabelError("")
        setLabelDialogOpen(false)
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload Images
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!isOnline && (
                        <Alert variant="destructive">
                            <WifiOff className="h-4 w-4" />
                            <AlertDescription>
                                You are offline. Please check your internet connection to upload images.
                            </AlertDescription>
                        </Alert>
                    )}

                    {isOnline && wasOffline && (
                        <Alert>
                            <Wifi className="h-4 w-4" />
                            <AlertDescription>You are back online. You can now upload images.</AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {!previewUrl ? (
                        <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                            <div className="flex flex-col items-center justify-center gap-2 text-center p-4">
                                <Upload className="h-10 w-10 text-muted-foreground" />
                                <p className="font-medium text-sm">Click to upload</p>
                                <p className="text-muted-foreground text-xs">PNG, JPG up to 5MB</p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={uploading || !isOnline}
                            />
                        </label>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative">
                                <Image
                                    src={previewUrl || "/placeholder.svg"}
                                    alt="Preview"
                                    width={400}
                                    height={192}
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={handleClear}
                                    disabled={uploading || saving}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {!uploadedFilename && (
                                <Button className="w-full" onClick={handleUpload} disabled={uploading || !isOnline}>
                                    {uploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading to Cloud...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload to Cloud
                                        </>
                                    )}
                                </Button>
                            )}

                            {uploadedFilename && (
                                <div className="p-3 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 text-sm rounded-md">
                                    Upload successful! Add a label to save to your gallery.
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <LabelInputDialog
                open={labelDialogOpen}
                onOpenChange={setLabelDialogOpen}
                onSave={handleSaveLabel}
                isLoading={saving}
                error={labelError}
            />
        </>
    )
}
