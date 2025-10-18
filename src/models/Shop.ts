// ============================================
// models/Shop.ts
// ============================================
import { Types, Document, Schema, model, models } from "mongoose";
import { IUser } from "@/models/User";
import { IProduct } from "@/models/Product";

export interface IShop extends Document {
    _id: Types.ObjectId;
    name: string;
    image?: string;
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
        image: {
            type: String,
            default: "",
        },
        owners: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }], // ✅ Array for multiple owners
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