import { Document, model, models, Schema, Types } from "mongoose";

export interface IInstitution extends Document {
	_id: Types.ObjectId;
	name: string;
	email?: string;
	phone?: string;
	address?: string;
	description?: string;
	logo?: string;
	website?: string;
	owner: Types.ObjectId;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const InstitutionSchema = new Schema<IInstitution>(
	{
		name: {
			type: String,
			required: [true, "Institution name is required"],
			trim: true,
			minlength: 2,
			maxlength: 100,
		},
		email: {
			type: String,
			lowercase: true,
			unique: true,
			trim: true,
			match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
		},
		phone: {
			type: String,
			trim: true,
		},
		address: {
			type: String,
			trim: true,
		},
		description: {
			type: String,
			maxlength: 500,
		},
		logo: {
			type: String,
		},
		website: {
			type: String,
			trim: true,
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Institution owner is required"],
			index: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
		toJSON: {
			virtuals: true,
		},
	}
);

// Indexes for better query performance
InstitutionSchema.index({ owner: 1, isActive: 1 });
InstitutionSchema.index({ name: 1 });

export const Institution = models.Institution || model<IInstitution>("Institution", InstitutionSchema);