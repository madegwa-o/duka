
// ============================================
// models/Shop.ts
// ============================================
import { Types, Document, Schema, model, models } from "mongoose";
import { IUser } from "@/models/User";
import { IProduct } from "@/models/Product";
import { IImage } from "@/models/Image";

export interface IShop extends Document {
    _id: Types.ObjectId;
    name: string;
    whatsappGroupUrl?: string;
    image?: Types.ObjectId | IImage; // ✅ Changed to reference Image model
    owners: (Types.ObjectId | IUser)[];
    products: (Types.ObjectId | IProduct)[];
    createdAt: Date;
    updatedAt: Date;
}

const ShopSchema = new Schema<IShop>(
    {
        name: {
            type: String,
            required: [true, "Shop name is required"],
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        whatsappGroupUrl: String,
        image: {
            type: Schema.Types.ObjectId,
            ref: 'Image',
            default: null,
        },
        owners: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }],
        products: [{
            type: Schema.Types.ObjectId,
            ref: "Product"
        }],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Indexes for performance
ShopSchema.index({ owners: 1 });
ShopSchema.index({ name: 1 });

export const Shop = models.Shop || model<IShop>('Shop', ShopSchema);
