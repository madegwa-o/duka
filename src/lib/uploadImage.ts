// lib/uploadImage.ts


export interface ImageData {
    filename: string;
    url: string;
    lastModified: string;
    size: number;
}



export async function uploadImage(file: File): Promise<string | null> {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/r2/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (response.ok && data.success && data.url) {
            // ✅ Return the image URL to the caller
            return data.url as string;
        } else {
            console.error('Upload failed:', data.error || 'Unknown error');
            return null;
        }
    } catch (error) {
        console.error('Upload error:', error);
        return null;
    }
}
