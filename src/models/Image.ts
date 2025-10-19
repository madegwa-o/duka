


// ============================================
// models/Image.ts
// ============================================
import { Types, Document, Schema, model, models } from "mongoose";
import { IUser } from "./User";

export interface IImage extends Document {
    _id: Types.ObjectId;
    label: string;
    url: string;
    owner: Types.ObjectId | IUser;
    createdAt: Date;
    updatedAt: Date;
}

const ImageSchema = new Schema<IImage>(
    {
        label: {
            type: String,
            required: [true, "Image label is required"],
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        url: {
            type: String,
            required: [true, "Image URL is required"],
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Indexes for performance
ImageSchema.index({ owner: 1 });
ImageSchema.index({ createdAt: -1 });

export const Image = models.Image || model<IImage>('Image', ImageSchema);