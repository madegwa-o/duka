// app/api/my-cart/add/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User, Product } from "@/models";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        // Get the authenticated user's session
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({
                error: 'Please sign in to add items to cart'
            }, { status: 401 });
        }

        const body = await req.json();
        const { productId } = body;

        if (!productId) {
            return NextResponse.json({
                error: 'Product ID is required'
            }, { status: 400 });
        }

        // Validate product ID format
        if (!Types.ObjectId.isValid(productId)) {
            return NextResponse.json({
                error: 'Invalid product ID'
            }, { status: 400 });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json({
                error: 'Product not found'
            }, { status: 404 });
        }

        const productObjectId = new Types.ObjectId(productId);

        // Check if product is already in cart
        const existingUser = await User.findOne({
            email: session.user.email,
            cart: productObjectId
        });

        if (existingUser) {
            return NextResponse.json({
                message: 'Product is already in your cart',
                alreadyExists: true
            }, { status: 200 });
        }

        // Add product to cart using $addToSet (prevents duplicates)
        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { $addToSet: { cart: productObjectId } },
            { new: true, select: 'cart' }
        );

        if (!updatedUser) {
            return NextResponse.json({
                error: 'User not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Product added to cart successfully',
            cartCount: updatedUser.cart.length
        }, { status: 200 });

    } catch (error) {
        console.error('Add to Cart Error:', error);
        return NextResponse.json({
            error: 'Failed to add product to cart',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}