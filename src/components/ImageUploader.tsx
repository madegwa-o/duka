'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadImage } from '@/lib/uploadImage';
import { Upload, X, FileImage } from 'lucide-react';


interface ImageUploaderProps {
    onUploadSuccess?: () => void;
    onUploadComplete?: (url: string) => void; // 👈 new callback
}

export default function ImageUploader({ onUploadSuccess, onUploadComplete }: ImageUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const compressImage = async (file: File): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d')!;

                    // Reduce to 0.25x size (50% width and height)
                    const newWidth = img.width * 0.5;
                    const newHeight = img.height * 0.5;

                    canvas.width = newWidth;
                    canvas.height = newHeight;

                    ctx.drawImage(img, 0, 0, newWidth, newHeight);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const compressedFile = new File(
                                    [blob],
                                    file.name,
                                    {
                                        type: 'image/jpeg',
                                        lastModified: Date.now(),
                                    }
                                );
                                resolve(compressedFile);
                            } else {
                                resolve(file);
                            }
                        },
                        'image/jpeg',
                        0.8
                    );
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const processFile = async (selected: File) => {
        if (selected && selected.type.startsWith('image/')) {
            setCompressing(true);

            let processedFile = selected;
            const fileSizeInMB = selected.size / (1024 * 1024);

            // Compress if file is larger than 1MB
            if (fileSizeInMB > 1) {
                processedFile = await compressImage(selected);
            }

            setFile(processedFile);
            setPreviewUrl(URL.createObjectURL(processedFile));
            setCompressing(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            await processFile(selected);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            await processFile(droppedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        const url = await uploadImage(file);

        if (url) {
            alert(`✅ success!! url: ${url}`);
            setFile(null);
            setPreviewUrl('');
            onUploadSuccess?.();
            onUploadComplete?.(url);
        } else {
            alert('❌ Upload failed.');
        }

        setUploading(false);
    };

    const handleRemove = () => {
        setFile(null);
        setPreviewUrl('');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">
                Upload Image
            </h2>

            <div className="space-y-4">
                {!previewUrl ? (
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => !compressing && inputRef.current?.click()}
                        className={`
							relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
							transition-all duration-200 ease-in-out
							${
                            dragActive && !compressing
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-[1.02]'
                                : 'border-border hover:border-blue-400 hover:bg-surface-hover'
                        }
                            ${compressing ? 'opacity-60 cursor-wait' : ''}
						`}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={compressing}
                        />

                        {compressing ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                                <div>
                                    <p className="text-base font-medium text-foreground mb-1">
                                        Compressing image...
                                    </p>
                                    <p className="text-sm text-text-secondary">
                                        Please wait
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <div
                                    className={`
								p-4 rounded-full transition-colors
								${
                                        dragActive
                                            ? 'bg-blue-100 dark:bg-blue-900/30'
                                            : 'bg-surface-secondary'
                                    }
							`}
                                >
                                    <Upload
                                        className={`w-8 h-8 ${
                                            dragActive
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-text-secondary'
                                        }`}
                                    />
                                </div>

                                <div>
                                    <p className="text-base font-medium text-foreground mb-1">
                                        {dragActive ? 'Drop your image here' : 'Drag & drop your image here'}
                                    </p>
                                    <p className="text-sm text-text-secondary">
                                        or click to browse
                                    </p>
                                </div>

                                <div className="text-xs text-text-tertiary mt-2">
                                    <div>Supports: JPG, PNG, GIF, WebP</div>
                                    <div className="mt-1 text-blue-600 dark:text-blue-400">
                                        Images over 1MB will be auto-compressed
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative rounded-xl overflow-hidden bg-surface-secondary border border-border">
                            <div className="relative w-full h-80">
                                <Image
                                    src={previewUrl}
                                    alt="Preview"
                                    fill
                                    className="object-contain"
                                />
                            </div>

                            <button
                                onClick={handleRemove}
                                disabled={uploading}
                                className="absolute top-3 right-3 p-2 bg-destructive/90 hover:bg-destructive text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Remove image"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {file && (
                            <div className="flex items-center gap-3 p-3 bg-surface-secondary rounded-lg border border-border">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <FileImage className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-text-secondary">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleRemove}
                                disabled={uploading}
                                className="flex-1 px-4 py-2.5 border border-button-border text-foreground rounded-lg hover:bg-button-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                Change Image
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                            >
                                {uploading ? (
                                    <span className="flex items-center justify-center gap-2">
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
										Uploading...
									</span>
                                ) : (
                                    'Upload Image'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}