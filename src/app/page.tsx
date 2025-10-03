'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageData {
  filename: string;
  url: string;
  lastModified: string;
  size: number;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch images from R2 bucket on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/images');
      const data = await response.json();

      if (data.images) {
        setUploadedImages(data.images);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the images list after successful upload
        await fetchImages();
        setFile(null);
        setPreviewUrl('');
        alert('Image uploaded successfully!');
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
      <div className="font-sans min-h-screen p-8 pb-20 bg-gray-50 dark:bg-gray-900">
        <main className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
            R2 Image Gallery
          </h1>

          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Upload Image
            </h2>

            <div className="space-y-4">
              <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 cursor-pointer"
              />

              {previewUrl && (
                  <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-contain"
                    />
                  </div>
              )}

              <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </div>

          {/* Images Gallery Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Gallery ({uploadedImages.length} images)
              </h2>
              <button
                  onClick={fetchImages}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading images...</p>
                </div>
            ) : uploadedImages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">No images yet. Upload your first image!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                      <div
                          key={image.filename}
                          className="group relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
                      >
                        <div className="relative aspect-square">
                          <Image
                              src={image.url}
                              alt={image.filename}
                              fill
                              className="object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100">
                          <p className="text-white text-xs text-center mb-2 break-all">
                            {image.filename}
                          </p>
                          <p className="text-gray-300 text-xs">
                            {formatFileSize(image.size)}
                          </p>
                          <p className="text-gray-300 text-xs">
                            {formatDate(image.lastModified)}
                          </p>
                          <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                    `${window.location.origin}${image.url}`
                                );
                                alert('URL copied to clipboard!');
                              }}
                              className="mt-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                          >
                            Copy URL
                          </button>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </main>
      </div>
  );
}