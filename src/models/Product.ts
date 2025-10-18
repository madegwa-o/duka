
// ============================================
// models/Product.ts
// ============================================
import { Types, Document, Schema, models, model } from "mongoose";
import { ICategory } from "@/models/Category";
import { IShop } from "@/models/Shop";

export interface IProduct extends Document {
    _id: Types.ObjectId;
    name: string;
    category: Types.ObjectId | ICategory;
    shop: Types.ObjectId | IShop; // ✅ Fixed: was IProduct, now IShop
    price: number;
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
        shop: {
            type: Schema.Types.ObjectId,
            ref: 'Shop', // ✅ Added ref
            required: [true, "Shop is required"]
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category', // ✅ Added ref
            required: [true, "Category is required"]
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"]
        },
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