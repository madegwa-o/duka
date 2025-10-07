import { NextResponse } from 'next/server';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { r2Client, BUCKET_NAME } from '@/lib/r2';

export async function GET() {
    try {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            MaxKeys: 100, // Adjust as needed
        });

        const response = await r2Client.send(command);

        const images = response.Contents?.map((item) => ({
            filename: item.Key,
            url: `/api/images/${item.Key}`,
            lastModified: item.LastModified,
            size: item.Size,
        })) || [];

        return NextResponse.json({ images });
    } catch (error) {
        console.error('List images error:', error);
        return NextResponse.json(
            { error: 'Failed to list images' },
            { status: 500 }
        );
    }
}