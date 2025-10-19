import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/db"
import {MedicalImage, User} from "@/models/User"

// GET - Fetch user's medical images
export async function GET() {
    try {
        const session = await getServerSession()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()
        const user = await User.findOne({ email: session.user.email })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ images: user.medicalImageUrls || [] })
    } catch (error) {
        console.error("Error fetching medical images:", error)
        return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
    }
}

// POST - Add new medical image to user's profile
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { imageLabel, imageUrl } = await request.json()

        if (!imageLabel || !imageUrl) {
            return NextResponse.json({ error: "Image label and URL are required" }, { status: 400 })
        }

        await connectToDatabase()
        const user = await User.findOne({ email: session.user.email })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Add new image to user's medical images
        user.medicalImageUrls.push({ imageLabel, imageUrl })
        await user.save()

        return NextResponse.json({
            success: true,
            images: user.medicalImageUrls,
        })
    } catch (error) {
        console.error("Error saving medical image:", error)
        return NextResponse.json({ error: "Failed to save image" }, { status: 500 })
    }
}

// DELETE - Remove medical image from user's profile
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { imageUrl } = await request.json()

        if (!imageUrl) {
            return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
        }

        await connectToDatabase()
        const user = await User.findOne({ email: session.user.email })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Remove image from user's medical images
        user.medicalImageUrls = user.medicalImageUrls.filter((img: MedicalImage) => img.imageUrl !== imageUrl)
        await user.save()

        return NextResponse.json({
            success: true,
            images: user.medicalImageUrls,
        })
    } catch (error) {
        console.error("Error deleting medical image:", error)
        return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
    }
}
