import { ImageResponse } from "next/og"
import { connectToDatabase } from "@/lib/db"
import { Product } from "@/models"
import { Types } from "mongoose"

export const runtime = "nodejs"

interface PopulatedProduct {
    _id: Types.ObjectId
    name: string
    description: string
    price: number
    category: {
        _id: Types.ObjectId
        name: string
    }
    shop: {
        _id: Types.ObjectId
        name: string
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ productId: string }> }) {
    try {
        const { productId } = await params

        if (!Types.ObjectId.isValid(productId)) {
            return new Response("Invalid product ID", { status: 400 })
        }

        await connectToDatabase()

        const product = await Product.findById(productId)
            .populate("category", "name")
            .populate({
                path: "shop",
                select: "name",
            })
            .lean<PopulatedProduct>()
            .exec()

        if (!product) {
            return new Response("Product not found", { status: 404 })
        }

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
            <div
                style={{
            fontSize: "24px",
                color: "#ff6b35",
                fontWeight: "bold",
                marginBottom: "10px",
        }}
    >
        {(product.category)?.name || "Product"}
        </div>
        <h1
        style={{
            fontSize: "64px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: "0 0 20px 0",
                lineHeight: 1.2,
        }}
    >
        {product.name}
        </h1>
        {product.description && (
            <p
                style={{
            fontSize: "24px",
                color: "#6b7280",
                margin: "0 0 20px 0",
                lineHeight: 1.4,
        }}
        >
            {product.description.substring(0, 100)}...
            </p>
        )}
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
            <div
                style={{
            fontSize: "32px",
                color: "#1f2937",
                marginBottom: "10px",
        }}
    >
        Shop: {(product.shop)?.name}
        </div>
        <div
        style={{
            fontSize: "48px",
                fontWeight: "bold",
                color: "#ff6b35",
        }}
    >
        sh{product.price.toFixed(2)}
        </div>
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
