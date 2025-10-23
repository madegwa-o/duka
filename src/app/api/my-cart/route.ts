// app/api/my-cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { IUser } from "@/models/User";

// Define Image interface
interface ImageData {
    _id: Types.ObjectId;
    label: string;
    url: string;
    publicId: string;
    owner: Types.ObjectId | IUser;
    createdAt: Date;
    updatedAt: Date;
}

// Define Category interface
interface CategoryData {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Define Shop Owner interface
interface ShopOwner {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

// Define Shop interface - Changed owner to owners (array)
interface ShopData {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    owners: ShopOwner[]; // Changed from owner to owners
}

// Define the types for the populated data
interface PopulatedProduct {
    _id: Types.ObjectId;
    name: string;
    description: string;
    price: number;
    images: ImageData[];
    category: CategoryData;
    shop: ShopData;
    createdAt: Date;
    updatedAt: Date;
}

// Define UserWithCart interface without index signature
interface UserWithCart {
    _id: Types.ObjectId;
    name: string;
    email: string;
    image?: string;
    phone?: string;
    address?: string;
    cart: PopulatedProduct[];
    shops: Types.ObjectId[];
    gallery: Types.ObjectId[];
    roles: string[];
    accountType: string;
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // Get the authenticated user's session
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({
                error: 'Unauthorized'
            }, { status: 401 });
        }

        // Find user with cart populated - properly typed
        const user = await User.findOne({ email: session.user.email })
            .populate({
                path: 'cart',
                populate: [
                    {
                        path: 'images',
                        model: 'Image'
                    },
                    {
                        path: 'shop',
                        model: 'Shop',
                        populate: {
                            path: 'owners', // Changed from 'owner' to 'owners'
                            model: 'User',
                            select: 'name email phone address'
                        }
                    },
                    {
                        path: 'category',
                        model: 'Category'
                    }
                ]
            })
            .lean<UserWithCart | null>();

        if (!user) {
            return NextResponse.json({
                error: 'User not found'
            }, { status: 404 });
        }

        // ✅ Check if cart exists and is an array
        if (!user.cart || !Array.isArray(user.cart)) {
            return NextResponse.json({
                success: true,
                cart: [],
                totalItems: 0
            }, { status: 200 });
        }

        // ✅ Filter out null/undefined products with proper type guard
        const validProducts = user.cart.filter((product): product is PopulatedProduct => {
            return (
                product !== null &&
                product !== undefined &&
                product._id !== undefined &&
                product.shop !== undefined &&
                product.shop.owners !== undefined &&
                product.shop.owners.length > 0 // Check that owners array has at least one owner
            );
        });

        // Transform the data to include owner contact details at product level
        const cartWithOwnerDetails = validProducts.map((product) => {
            // Get the first owner (primary owner)
            const primaryOwner = product.shop.owners[0];

            return {
                _id: product._id.toString(),
                name: product.name,
                description: product.description,
                price: product.price,
                images: product.images.map(img => ({
                    _id: img._id.toString(),
                    label: img.label,
                    url: img.url,
                    publicId: img.publicId
                })),
                category: product.category ? {
                    _id: product.category._id.toString(),
                    name: product.category.name,
                    description: product.category.description
                } : null,
                shop: {
                    _id: product.shop._id.toString(),
                    name: product.shop.name,
                    description: product.shop.description || '',
                },
                ownerContact: {
                    name: primaryOwner.name,
                    email: primaryOwner.email,
                    phone: primaryOwner.phone || null,
                    address: primaryOwner.address || null,
                },
                createdAt: product.createdAt.toISOString(),
                updatedAt: product.updatedAt.toISOString(),
            };
        });

        return NextResponse.json({
            success: true,
            cart: cartWithOwnerDetails,
            totalItems: cartWithOwnerDetails.length
        }, { status: 200 });

    } catch (error) {
        console.error('Cart API Error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}