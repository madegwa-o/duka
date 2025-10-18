// app/api/shops/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import {Product, Shop, User} from '@/models';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const url = new URL(req.url);
        const currentUserId = url.searchParams.get('userid');


        // Find shops where user is an owner
        const shops = await Shop.find({ owners: currentUserId })
            .populate('owners', 'name email image')
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
            { success: false, message: 'Failed to fetch shops' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const ownerId = url.searchParams.get('ownerId');

        console.log('ownerId:  ', ownerId);

        const body = await req.json();
        const { name, image } = body;

        if (!name || name.trim().length < 2) {
            return NextResponse.json(
                { success: false, message: 'Shop name must be at least 2 characters' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Create new shop with current user as owner
        const shop = await Shop.create({
            name: name.trim(),
            image: image || '',
            owners: [ownerId],
            products: []
        });

        const user =  await User.findById( ownerId).lean();

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Add owner to shop and shop to user
        await User.findByIdAndUpdate(ownerId, { $addToSet: { shops: shop._id } });




        // Populate owner details
        await shop.populate('owners', 'name email image');

        return NextResponse.json({
            success: true,
            shop,
            message: 'Shop created successfully'
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating shop:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create shop' },
            { status: 500 }
        );
    }
}


export async function DELETE( req: NextRequest) {
    try {
        const url = new URL(req.url);

        const shopId =  url.searchParams.get('shopId');

        console.log('shop id:  ', shopId);

        await connectToDatabase();


        // Check if shop exists
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return NextResponse.json(
                { success: false, message: "Shop not found" },
                { status: 404 }
            );
        }

        // Delete all products under this shop
        await Product.deleteMany({ shop: shopId });

        // Remove shop reference from all owners
        await User.updateMany(
            { _id: { $in: shop.owners } },
            { $pull: { shops: shop._id } }
        );

        // Finally, delete the shop
        await Shop.findByIdAndDelete(shopId);

        return NextResponse.json({
            success: true,
            message: "Shop and its products deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting shop:", error);
        return NextResponse.json(
            { success: false, message: "Failed to delete shop" },
            { status: 500 }
        );
    }
}