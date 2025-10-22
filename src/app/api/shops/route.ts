// ============================================
// app/api/shops/route.tsx
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { connectToDatabase } from '@/lib/db';
import { Product, Shop, User, Image } from '@/models';

interface UserDoc {
    _id: string;
    email: string;
}

// GET - Fetch all shops owned by the authenticated user
export async function GET() {
    try {
        const session = await getServerSession();

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

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

        // Find shops where user is an owner
        const shops = await Shop.find({ owners: user._id })
            .populate('owners', 'name email image')
            .populate({
                path: 'image',
                select: 'label url'
            })
            .populate({
                path: 'products',
                populate: {
                    path: 'category',
                    select: 'name slug'
                }
            })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            shops,
            count: shops.length
        });
    } catch (error) {
        console.error('Error fetching shops:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch shops' },
            { status: 500 }
        );
    }
}

// POST - Create a new shop
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name, image } = body;

        // Validate shop name
        if (!name || name.trim().length < 2) {
            return NextResponse.json(
                { success: false, error: 'Shop name must be at least 2 characters' },
                { status: 400 }
            );
        }

        if (name.trim().length > 100) {
            return NextResponse.json(
                { success: false, error: 'Shop name must not exceed 100 characters' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Find user by email
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // If image is provided, verify it exists and belongs to the user
        if (image) {
            const imageDoc = await Image.findById(image);

            if (!imageDoc) {
                return NextResponse.json(
                    { success: false, error: 'Selected image not found' },
                    { status: 404 }
                );
            }

            if (imageDoc.owner.toString() !== user._id.toString()) {
                return NextResponse.json(
                    { success: false, error: 'Unauthorized to use this image' },
                    { status: 403 }
                );
            }
        }

        // Create new shop with current user as owner
        const shop = await Shop.create({
            name: name.trim(),
            image: image || null,
            owners: [user._id],
            products: []
        });

        // Add shop to user's shops array
        user.shops.push(shop._id);
        await user.save();

        // Populate shop details
        await shop.populate('owners', 'name email image');
        await shop.populate('image', 'label url');

        // Fetch all shops for the user to return
        const shops = await Shop.find({ owners: user._id })
            .populate('owners', 'name email image')
            .populate('image', 'label url')
            .populate({
                path: 'products',
                populate: {
                    path: 'category',
                    select: 'name slug'
                }
            })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            shop,
            shops,
            message: 'Shop created successfully'
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating shop:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create shop' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a shop
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const url = new URL(req.url);
        const shopId = url.searchParams.get('shopId');

        if (!shopId) {
            return NextResponse.json(
                { success: false, error: "Shop ID is required" },
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

        // Check if shop exists
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return NextResponse.json(
                { success: false, error: "Shop not found" },
                { status: 404 }
            );
        }

        // Check if user is an owner of this shop
        const isOwner = shop.owners.some(
            (ownerId: string) => ownerId.toString() === user._id.toString()
        );

        if (!isOwner) {
            return NextResponse.json(
                { success: false, error: "Unauthorized to delete this shop" },
                { status: 403 }
            );
        }

        // Delete all products under this shop
        await Product.deleteMany({ shop: shopId });

        // Remove shop reference from all owners
        await User.updateMany(
            { _id: { $in: shop.owners } },
            { $pull: { shops: shop._id } }
        );

        // Delete the shop
        await Shop.findByIdAndDelete(shopId);

        // Fetch remaining shops for the user
        const shops = await Shop.find({ owners: user._id })
            .populate('owners', 'name email image')
            .populate('image', 'label url')
            .populate({
                path: 'products',
                populate: {
                    path: 'category',
                    select: 'name slug'
                }
            })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            shops,
            message: "Shop and its products deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting shop:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete shop" },
            { status: 500 }
        );
    }
}