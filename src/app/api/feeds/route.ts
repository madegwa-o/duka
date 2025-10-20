import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models";
import { FilterQuery, Types } from "mongoose";
import { IProduct } from "@/models/Product";

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // Extract query parameters
        const searchParams = req.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const category = searchParams.get('category');
        const shop = searchParams.get('shop');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            return NextResponse.json(
                { error: 'Invalid pagination parameters' },
                { status: 400 }
            );
        }

        // Build filter object with proper typing
        const filter: FilterQuery<IProduct> = {};
        if (category) {
            filter.category = new Types.ObjectId(category);
        }
        if (shop) {
            filter.shop = new Types.ObjectId(shop);
        }

        // Calculate skip value
        const skip = (page - 1) * limit;

        // Execute queries in parallel
        const [products, totalCount] = await Promise.all([
            Product.find(filter)
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit)
                .populate('category', 'name')
                .populate('shop', 'name')
                .populate('images', 'url alt')
                .lean()
                .exec(),
            Product.countDocuments(filter)
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return NextResponse.json({
            success: true,
            products,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                limit,
                hasNextPage,
                hasPrevPage,
                nextPage: hasNextPage ? page + 1 : null,
                prevPage: hasPrevPage ? page - 1 : null
            }
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}