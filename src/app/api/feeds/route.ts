import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Product } from "@/models"
import { type FilterQuery, Types } from "mongoose"
import type { IProduct } from "@/models/Product"

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase()

        // Extract query parameters
        const searchParams = req.nextUrl.searchParams
        const page = Number.parseInt(searchParams.get("page") || "1", 10)
        const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
        const search = searchParams.get("search")
        const categories = searchParams.getAll("categories")
        const priceMin = searchParams.get("priceMin")
        const priceMax = searchParams.get("priceMax")
        const sortBy = searchParams.get("sortBy") || "createdAt"
        const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            return NextResponse.json({ error: "Invalid pagination parameters" }, { status: 400 })
        }

        const filter: FilterQuery<IProduct> = {}

        if (search && search.trim()) {
            filter.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
        }

        if (categories && categories.length > 0) {
            const categoryIds = categories.map((cat) => new Types.ObjectId(cat))
            filter.category = { $in: categoryIds }
        }

        if (priceMin || priceMax) {
            filter.price = {}
            if (priceMin) {
                filter.price.$gte = Number.parseFloat(priceMin)
            }
            if (priceMax) {
                filter.price.$lte = Number.parseFloat(priceMax)
            }
        }

        // Calculate skip value
        const skip = (page - 1) * limit

        // Execute queries in parallel
        const [products, totalCount] = await Promise.all([
            Product.find(filter)
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit)
                .populate("category", "name")
                .populate("shop", "name")
                .populate("images", "url alt")
                .lean()
                .exec(),
            Product.countDocuments(filter),
        ])

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit)
        const hasNextPage = page < totalPages
        const hasPrevPage = page > 1

        return NextResponse.json({
            success: true,
            products,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                limit,
                hasNextPage,
                hasPrevPage,
                nextPage: hasNextPage ? page + 1 : null,
                prevPage: hasPrevPage ? page - 1 : null,
            },
        })
    } catch (error) {
        console.error("Error fetching products:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
