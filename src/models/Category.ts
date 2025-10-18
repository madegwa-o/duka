
// ============================================
// models/Category.ts
// ============================================
import { Types, Document, Schema, model, models } from "mongoose";

export interface ICategory extends Document {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        slug: {
            type: String,
            required: [true, "Slug is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);


export const Category = models.Category || model<ICategory>('Category', CategorySchema);