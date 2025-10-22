// ============================================
// app/api/products/route.tsx
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { connectToDatabase } from '@/lib/db';
import { Product, Shop, User, Image, Category } from '@/models';

interface UserDoc {
    _id: string;
    email: string;
}

// GET - Fetch all products for shops owned by the authenticated user
export async function GET() {
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
        const user = await User.findOne({ email: session.user.email }).lean<UserDoc>();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        // Find all shops owned by the user
        const userShops = await Shop.find({ owners: user._id }).select('_id').lean();
        const shopIds = userShops.map(shop => shop._id);

        // Find all products that belong to the user's shops
        const products = await Product.find({ shop: { $in: shopIds } })
            .populate('shop', 'name image')
            .populate('category', 'name slug')
            .populate('images', 'label url')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            products,
            count: products.length
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

// POST - Create a new product
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
        const { name, description, price, shop, categorySlug, images } = body;

        // Validate required fields
        if (!name || name.trim().length < 2) {
            return NextResponse.json(
                { success: false, error: 'Product name must be at least 2 characters' },
                { status: 400 }
            );
        }

        if (name.trim().length > 200) {
            return NextResponse.json(
                { success: false, error: 'Product name must not exceed 200 characters' },
                { status: 400 }
            );
        }
        if (description.trim().length > 1000) {
            return NextResponse.json(
                { success: false, error: 'Product description must not exceed 1000 characters' },
                { status: 400 }
            );
        }

        if (!price || price < 0) {
            return NextResponse.json(
                { success: false, error: 'Price must be a positive number' },
                { status: 400 }
            );
        }

        if (!shop) {
            return NextResponse.json(
                { success: false, error: 'Shop is required' },
                { status: 400 }
            );
        }

        if (!categorySlug || !categorySlug.trim()) {
            return NextResponse.json(
                { success: false, error: 'Category is required' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Find user by email
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Verify shop exists and user is an owner
        const shopDoc = await Shop.findById(shop);

        if (!shopDoc) {
            return NextResponse.json(
                { success: false, error: 'Shop not found' },
                { status: 404 }
            );
        }

        const isOwner = shopDoc.owners.some(
            (ownerId: { toString: () => string; }) => ownerId.toString() === user._id.toString()
        );

        if (!isOwner) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized to add products to this shop' },
                { status: 403 }
            );
        }

        // Verify all images exist and belong to the user
        if (images && images.length > 0) {
            for (const imageId of images) {
                const imageDoc = await Image.findById(imageId);

                if (!imageDoc) {
                    return NextResponse.json(
                        { success: false, error: `Image ${imageId} not found` },
                        { status: 404 }
                    );
                }

                if (imageDoc.owner.toString() !== user._id.toString()) {
                    return NextResponse.json(
                        { success: false, error: 'Unauthorized to use one or more images' },
                        { status: 403 }
                    );
                }
            }
        }

        // Handle category - find existing or create new
        const slug = categorySlug.trim().toLowerCase().replace(/\s+/g, '-');
        let category = await Category.findOne({ slug });
        let categoryCreated = false;

        if (!category) {
            // Create new category
            // Convert slug to a readable name (e.g., "fresh-fruits" -> "Fresh Fruits")
            const categoryName = slug
                .split('-')
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            category = await Category.create({
                name: categoryName,
                slug: slug
            });
            categoryCreated = true;
        }

        // Create the product
        const product = await Product.create({
            name: name.trim(),
            description: description.trim(),
            price: parseFloat(price),
            shop,
            category: category._id,
            images: images || []
        });

        // Add product to shop's products array
        shopDoc.products.push(product._id);
        await shopDoc.save();

        // Populate product details
        await product.populate('shop', 'name image');
        await product.populate('category', 'name slug');
        await product.populate('images', 'label url');

        // Fetch all products for the user's shops to return
        const userShops = await Shop.find({ owners: user._id }).select('_id').lean();
        const shopIds = userShops.map(s => s._id);

        const products = await Product.find({ shop: { $in: shopIds } })
            .populate('shop', 'name image')
            .populate('category', 'name slug')
            .populate('images', 'label url')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            product,
            products,
            categoryCreated,
            message: categoryCreated
                ? `Product created successfully with new category "${category.name}"`
                : 'Product created successfully'
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create product' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a product
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const url = new URL(req.url);
        const productId = url.searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { success: false, error: "Product ID is required" },
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

        // Find the product
        const product = await Product.findById(productId).populate('shop');

        if (!product) {
            return NextResponse.json(
                { success: false, error: "Product not found" },
                { status: 404 }
            );
        }

        // Verify user owns the shop that the product belongs to
        const shop = product.shop;
        const isOwner = shop.owners.some(
            (ownerId: string) => ownerId.toString() === user._id.toString()
        );

        if (!isOwner) {
            return NextResponse.json(
                { success: false, error: "Unauthorized to delete this product" },
                { status: 403 }
            );
        }

        // Remove product from shop's products array
        await Shop.findByIdAndUpdate(
            product.shop,
            { $pull: { products: product._id } }
        );

        // Delete the product
        await Product.findByIdAndDelete(productId);

        // Fetch remaining products for the user's shops
        const userShops = await Shop.find({ owners: user._id }).select('_id').lean();
        const shopIds = userShops.map(s => s._id);

        const products = await Product.find({ shop: { $in: shopIds } })
            .populate('shop', 'name image')
            .populate('category', 'name slug')
            .populate('images', 'label url')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            products,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete product" },
            { status: 500 }
        );
    }
}