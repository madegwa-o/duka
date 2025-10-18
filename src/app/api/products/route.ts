import {NextResponse} from "next/server";
import {Product} from "@/models";
import {connectToDatabase} from "@/lib/db";


export async function GET() {
    try {

        await connectToDatabase();

        const products = await Product.find().lean();

        return NextResponse.json(
            {
                success: true,
                products,
                count: products.length
            }
        );

    } catch (error) {
      console.log(error);
      NextResponse.json({
          success: false,
          status: 500,
      })
    }
}