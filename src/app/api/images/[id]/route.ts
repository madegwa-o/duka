// ============================================
// app/api/images/[id]/route.ts
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Image } from "@/models/Image";
import { User } from "@/models/User";
import { Shop } from "@/models/Shop";
import { Product } from "@/models/Product";
import { connectToDatabase } from "@/lib/db";

// DELETE - Delete an image
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession();

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        const imageId = id;

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

        // Verify ownership
        if (image.owner.toString() !== user._id.toString()) {
            return NextResponse.json(
                { success: false, error: "Unauthorized to delete this image" },
                { status: 403 }
            );
        }

        // Prevent deletion if image is in use
        const shopsUsingImage = await Shop.find({ image: imageId });
        if (shopsUsingImage.length > 0) {
            return NextResponse.json(
                { success: false, error: "Image is used by one or more shops." },
                { status: 400 }
            );
        }

        const productsUsingImage = await Product.find({ images: imageId });
        if (productsUsingImage.length > 0) {
            return NextResponse.json(
                { success: false, error: "Image is used by one or more products." },
                { status: 400 }
            );
        }

        // Remove image from user's gallery
        user.gallery = user.gallery.filter(
            (imgId: string) => imgId.toString() !== imageId
        );
        await user.save();

        // Delete image
        await Image.findByIdAndDelete(imageId);

        // Return updated gallery
        const images = await Image.find({ owner: user._id })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            message: "Image deleted successfully",
            images,
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
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession();

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        const imageId = id;

        await connectToDatabase();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        const image = await Image.findById(imageId).lean();
        if (!image) {
            return NextResponse.json(
                { success: false, error: "Image not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            image,
        });
    } catch (error) {
        console.error("Error fetching image:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch image" },
            { status: 500 }
        );
    }
}
