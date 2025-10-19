
// ============================================
// app/api/images/[id]/route.ts
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Image } from "@/models/Image";
import { User } from "@/models/User";
import { Shop } from "@/models/Shop";
import { Product } from "@/models/Product";
import {connectToDatabase} from "@/lib/db";

// DELETE - Delete an image
export async function DELETE(
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

        const imageId = params.id;

        await connectToDatabase();

        // Find user by email
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        // Find the image
        const image = await Image.findById(imageId);

        if (!image) {
            return NextResponse.json(
                { success: false, error: "Image not found" },
                { status: 404 }
            );
        }

        // Check if user owns this image
        if (image.owner.toString() !== user._id.toString()) {
            return NextResponse.json(
                { success: false, error: "Unauthorized to delete this image" },
                { status: 403 }
            );
        }

        // Check if image is being used in any shop
        const shopsUsingImage = await Shop.find({ image: imageId });
        if (shopsUsingImage.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Cannot delete image. It is being used by one or more shops."
                },
                { status: 400 }
            );
        }

        // Check if image is being used in any product
        const productsUsingImage = await Product.find({ images: imageId });
        if (productsUsingImage.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Cannot delete image. It is being used by one or more products."
                },
                { status: 400 }
            );
        }

        // Remove image from user's gallery
        user.gallery = user.gallery.filter(
            (imgId: string) => imgId.toString() !== imageId
        );
        await user.save();

        // Delete the image
        await Image.findByIdAndDelete(imageId);

        // Fetch remaining images for the user
        const images = await Image.find({ owner: user._id })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            message: "Image deleted successfully",
            images: images,
        });
    } catch (error) {
        console.error("Error deleting image:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete image" },
            { status: 500 }
        );
    }
}

// GET - Get a single image by ID
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

        const imageId = params.id;

        await connectToDatabase();

        // Find user by email
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        // Find the image
        const image = await Image.findById(imageId).lean();

        if (!image) {
            return NextResponse.json(
                { success: false, error: "Image not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            image: image,
        });
    } catch (error) {
        console.error("Error fetching image:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch image" },
            { status: 500 }
        );
    }
}