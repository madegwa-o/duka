// app/api/public-product/[id]/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models';

// GET - Get a single product by ID with full details
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    try {
        const productId = id;
        await connectToDatabase();

        // Find the product with all related data
        const product = await Product.findById(productId)
            .populate({
                path: 'shop',
                select: 'name image whatsappGroupUrl owners',
                populate: [
                    {
                        path: 'image',
                        select: 'url label'
                    },
                    {
                        path: 'owners',
                        select: 'name email phone image address'
                    }
                ]
            })
            .populate('category', 'name slug')
            .populate('images', 'label url')
            .lean();

        if (!product) {
            return NextResponse.json(
                { success: false, error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}