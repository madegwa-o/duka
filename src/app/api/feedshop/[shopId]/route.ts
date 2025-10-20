// ============================================
// app/api/feedshop/[shopId]/route.ts
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Shop, Product, User } from "@/models";
import { Types } from "mongoose";
import {IShop} from "@/models/Shop";


export async function GET(
    req: NextRequest,
    context: { params: Promise<{ shopId: string }> }
) {
    try {
        await connectToDatabase();

        const { shopId } = await context.params;

        // Validate shopId format
        if (!Types.ObjectId.isValid(shopId)) {
            return NextResponse.json(
                { error: 'Invalid shop ID format' },
                { status: 400 }
            );
        }

        // Fetch shop with populated data
        const shop = await Shop.findById(shopId)
            .populate({
                path: 'image',
                select: 'url label'
            })
            .populate({
                path: 'owners',
                select: 'name email phone image address'
            })
            .lean<IShop>()
            .exec();

        if (!shop) {
            return NextResponse.json(
                { error: 'Shop not found' },
                { status: 404 }
            );
        }

        // Fetch all products for this shop
        const products = await Product.find({ shop: shopId })
            .populate('category', 'name slug')
            .populate('images', 'url label')
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        // Get product count
        const productCount = products.length;

        // Return combined data
        return NextResponse.json({
            success: true,
            shop: {
                _id: shop._id,
                name: shop.name,
                image: shop.image,
                createdAt: shop.createdAt,
                updatedAt: shop.updatedAt,
                productCount
            },
            owners: shop.owners,
            products,
        });

    } catch (error) {
        console.error('Error fetching shop data:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}