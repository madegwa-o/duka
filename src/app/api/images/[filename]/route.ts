import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, BUCKET_NAME } from '@/lib/r2';
import { Readable } from 'stream';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: filename,
        });

        const response = await r2Client.send(command);

        if (!response.Body) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            );
        }

        console.log('response: ', response);

        // Convert stream to buffer
        const chunks: Uint8Array[] = [];
        const body = response.Body as Readable;

        for await (const chunk of body) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Return image with appropriate headers
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': response.ContentType || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Image fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch image' },
            { status: 500 }
        );
    }
}