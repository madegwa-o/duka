
// ============================================
// app/api/products/[id]/route.tsx
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { connectToDatabase } from '@/lib/db';
import { Product, User, Image } from '@/models';

interface UserDoc {
    _id: string;
    email: string;
}

type ProductUpdateFields = Partial<Pick<PopulatedProduct, "name" | "price" | "category" | "images">>;


interface PopulatedProduct {
    _id: string;
    name: string;
    price: number;
    category: {
        _id: string;
        name: string;
        slug: string;
    };
    shop: {
        _id: string;
        name: string;
        image: string;
        owners: string[];
    };
    images: {
        _id: string;
        label: string;
        url: string;
    }[];
}


// GET - Get a single product by ID
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    try {

        const productId = id;

        await connectToDatabase();


        // Find the product
        const product = await Product.findById(productId)
            .populate('shop', 'name image owners')
            .populate('category', 'name slug')
            .populate('images', 'label url')
            .lean<PopulatedProduct>();

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
