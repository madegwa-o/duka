
// ============================================
// models/Product.ts
// ============================================
import { Types, Document, Schema, models, model } from "mongoose";
import { ICategory } from "@/models/Category";
import { IShop } from "@/models/Shop";
import { IImage } from "@/models/Image";

export interface IProduct extends Document {
    _id: Types.ObjectId;
    name: string;
    description: string;
    category: Types.ObjectId | ICategory;
    shop: Types.ObjectId | IShop;
    price: number;
    images: (Types.ObjectId | IImage)[]; // ✅ Added images array referencing Image model
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minlength: 2,
            maxlength: 200,
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true,
            minlength: 2,
            maxlength: 1000,
        },
        shop: {
            type: Schema.Types.ObjectId,
            ref: 'Shop',
            required: [true, "Shop is required"]
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, "Category is required"]
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"]
        },
        images: [{
            type: Schema.Types.ObjectId,
            ref: 'Image'
        }],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Indexes for performance
ProductSchema.index({ shop: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ name: 1 });

export const Product = models.Product || model<IProduct>('Product', ProductSchema);