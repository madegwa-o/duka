import { ImageResponse } from "next/og"
import { connectToDatabase } from "@/lib/db"
import { Shop } from "@/models"
import { Types } from "mongoose"

export const runtime = "nodejs"



// Define the populated shop type
interface PopulatedShop {
    _id: Types.ObjectId;
    name: string;
    owners: Array<{
        _id: Types.ObjectId;
        name: string;
        address?: string;
    }>;
}


export async function GET(req: Request, { params }: { params: Promise<{ shopId: string }> }) {
    try {
        const { shopId } = await params

        if (!Types.ObjectId.isValid(shopId)) {
            return new Response("Invalid shop ID", { status: 400 })
        }

        await connectToDatabase()

        const shop = await Shop.findById(shopId)
            .populate({
                path: "owners",
                select: "name address",
            })
            .lean<PopulatedShop>()
            .exec()

        if (!shop) {
            return new Response("Shop not found", { status: 404 })
        }

        const owner = (shop.owners)?.[0]

        return new ImageResponse(
            <div
                style={{
            display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                backgroundColor: "#ffffff",
                padding: "60px",
                fontFamily: "system-ui, -apple-system, sans-serif",
        }}
    >
        {/* Background gradient */}
        <div
            style={{
            position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(135deg, #ff6b35 0%, #00d4ff 100%)",
                opacity: 0.1,
        }}
        />

        {/* Content */}
        <div
            style={{
            display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                position: "relative",
                zIndex: 1,
        }}
    >
        {/* Header */}
        <div>
            <h1
                style={{
            fontSize: "72px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: "0 0 20px 0",
                lineHeight: 1.2,
        }}
    >
        {shop.name}
        </h1>
        <p
        style={{
            fontSize: "32px",
                color: "#6b7280",
                margin: 0,
        }}
    >
        Quality products on Duka Marketplace
        </p>
        </div>

        {/* Footer */}
        <div
            style={{
            display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
        }}
    >
        <div>
            {owner && (
            <div
                style={{
            fontSize: "24px",
                color: "#1f2937",
                marginBottom: "10px",
        }}
    >
        Owner: {owner.name}
        </div>
    )}
        {owner?.address && (
            <div
                style={{
            fontSize: "20px",
                color: "#6b7280",
        }}
        >
        📍 {owner.address}
            </div>
        )}
        </div>
        <div
        style={{
            fontSize: "48px",
                fontWeight: "bold",
                color: "#ff6b35",
        }}
    >
        Duka
        </div>
        </div>
        </div>
        </div>,
        {
            width: 1200,
                height: 630,
        },
    )
    } catch (error) {
        console.error("OG image generation error:", error)
        return new Response("Failed to generate OG image", { status: 500 })
    }
}
