

// ============================================
// app/api/images/route.tsx
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Image } from "@/models/Image";
import { User } from "@/models/User";
import {connectToDatabase} from "@/lib/db";


export async function GET(req: NextRequest) {
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
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        // Fetch all images owned by this user, sorted by newest first
        const images = await Image.find({ owner: user._id })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            images: images,
        });
    } catch (error) {
        console.error("Error fetching images:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch images" },
            { status: 500 }
        );
    }
}

// POST - Create a new image and add to user's gallery
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
        const { label, url } = body;

        // Validate input
        if (!label || !url) {
            return NextResponse.json(
                { success: false, error: "Label and URL are required" },
                { status: 400 }
            );
        }

        if (label.trim().length < 2 || label.trim().length > 100) {
            return NextResponse.json(
                { success: false, error: "Label must be between 2 and 100 characters" },
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

        // Create new image
        const newImage = await Image.create({
            label: label.trim(),
            url: url,
            owner: user._id,
        });

        // Add image to user's gallery
        user.gallery.push(newImage._id);
        await user.save();

        // Fetch all images for the user to return
        const images = await Image.find({ owner: user._id })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            image: newImage,
            images: images,
        });
    } catch (error) {
        console.error("Error creating image:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create image" },
            { status: 500 }
        );
    }
}