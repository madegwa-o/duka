import {NextResponse} from "next/server";
import {connectToDatabase} from "@/lib/db";
import {Category} from "@/models";


export async function GET() {
    try {
        await connectToDatabase();

        const categories = await Category.find().sort({ name: 1 }).lean();

        return NextResponse.json({
            success: true,
            categories,
            count: categories.length
        });

    }catch (error) {
        console.error(error);
        return NextResponse.json(
            {success: false, message: 'Failed to  fetch categories' },
            {status: 500}
        )
    }
}