
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
        const session = await getServerSession();

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const productId = id;

        await connectToDatabase();

        // Find user by email
        const user = await User.findOne({ email: session.user.email })
            .lean<UserDoc>();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

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

        // Verify user owns the shop
        const shop = product.shop;
        const isOwner = shop.owners.some(
            (ownerId: string) => ownerId.toString() === user._id.toString()
        );

        if (!isOwner) {
            return NextResponse.json(
                { success: false, error: "Unauthorized to access this product" },
                { status: 403 }
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

// PUT - Update a product
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    try {
        const session = await getServerSession();

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const productId = id;
        const body = await req.json();
        const { name, price, category, images } = body;

        // Validate fields if provided
        if (name !== undefined) {
            if (!name || name.trim().length < 2) {
                return NextResponse.json(
                    { success: false, error: 'Product name must be at least 2 characters' },
                    { status: 400 }
                );
            }

            if (name.trim().length > 200) {
                return NextResponse.json(
                    { success: false, error: 'Product name must not exceed 200 characters' },
                    { status: 400 }
                );
            }
        }

        if (price !== undefined && price < 0) {
            return NextResponse.json(
                { success: false, error: 'Price must be a positive number' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Find user by email
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        // Find the product
        const product = await Product.findById(productId).populate('shop');

        if (!product) {
            return NextResponse.json(
                { success: false, error: "Product not found" },
                { status: 404 }
            );
        }

        // Verify user owns the shop
        const shop = product.shop;
        const isOwner = shop.owners.some(
            (ownerId: string) => ownerId.toString() === user._id.toString()
        );

        if (!isOwner) {
            return NextResponse.json(
                { success: false, error: "Unauthorized to update this product" },
                { status: 403 }
            );
        }

        // Verify all images exist and belong to the user if images are being updated
        if (images && images.length > 0) {
            for (const imageId of images) {
                const imageDoc = await Image.findById(imageId);

                if (!imageDoc) {
                    return NextResponse.json(
                        { success: false, error: `Image ${imageId} not found` },
                        { status: 404 }
                    );
                }

                if (imageDoc.owner.toString() !== user._id.toString()) {
                    return NextResponse.json(
                        { success: false, error: 'Unauthorized to use one or more images' },
                        { status: 403 }
                    );
                }
            }
        }

        // Update product
        const updateData: ProductUpdateFields = {};
        if (name !== undefined) updateData.name = name.trim();
        if (price !== undefined) updateData.price = parseFloat(price);
        if (category !== undefined) updateData.category = category;
        if (images !== undefined) updateData.images = images;

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('shop', 'name image')
            .populate('category', 'name slug')
            .populate('images', 'label url');

        return NextResponse.json({
            success: true,
            product: updatedProduct,
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update product' },
            { status: 500 }
        );
    }
}