
// ============================================
// app/api/shops/[id]/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { connectToDatabase } from '@/lib/db';
import { Shop, User, Image } from '@/models';

interface UserDoc {
    _id: string;
    email: string;
}


type ShopUpdateFields = Partial<Pick<ShopDoc, "name" | "image">>;

interface ShopOwner {
    _id: string;
    name: string;
    email: string;
    image?: string;
}

interface ShopDoc {
    _id: string;
    name: string;
    image?: string | null;
    owners: ShopOwner[];
    products?: Array<{
        _id: string;
        name: string;
        category?: { name: string; slug: string };
        images?: { label: string; url: string }[];
    }>;
}


// GET - Get a single shop by ID
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const shopId = params.id;

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

        // Find the shop
        const shop = await Shop.findById(shopId)
            .populate('owners', 'name email image')
            .populate('image', 'label url')
            .populate({
                path: 'products',
                populate: [
                    { path: 'category', select: 'name slug' },
                    { path: 'images', select: 'label url' },
                ],
            })
            .lean<ShopDoc>();


        if (!shop) {
            return NextResponse.json(
                { success: false, error: "Shop not found" },
                { status: 404 }
            );
        }

        // Check if user is an owner of this shop
        const isOwner = shop.owners.some(
            (owner) => owner._id.toString() === user._id.toString()
        );


        if (!isOwner) {
            return NextResponse.json(
                { success: false, error: "Unauthorized to access this shop" },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            shop
        });
    } catch (error) {
        console.error('Error fetching shop:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch shop' },
            { status: 500 }
        );
    }
}

// PUT - Update a shop
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const shopId = params.id;
        const body = await req.json();
        const { name, image } = body;

        // Validate shop name if provided
        if (name !== undefined) {
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

        // Find the shop
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
                { success: false, error: "Unauthorized to update this shop" },
                { status: 403 }
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

        // Update shop
        const updateData: ShopUpdateFields = {};

        if (name !== undefined) updateData.name = name.trim();
        if (image !== undefined) updateData.image = image || null;

        const updatedShop = await Shop.findByIdAndUpdate(
            shopId,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('owners', 'name email image')
            .populate('image', 'label url');

        return NextResponse.json({
            success: true,
            shop: updatedShop,
            message: 'Shop updated successfully'
        });
    } catch (error) {
        console.error('Error updating shop:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update shop' },
            { status: 500 }
        );
    }
}