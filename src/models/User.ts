
// ============================================
// models/User.ts
// ============================================
import { Schema, model, models, Types, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { IShop } from "./Shop";
import { IImage } from "./Image";

export enum Role {
	ADMIN = "ADMIN",
	MERCHANT = "MERCHANT",
	USER = "USER",
}

export enum AccountType {
	PREMIUM = "PREMIUM",
	FREEMIUM = "FREEMIUM",
}

export interface IUser extends Document {
	_id: Types.ObjectId;
	name: string;
	email: string;
	password?: string;
	image?: string;
	phone?: string;
	address?: string;
	shops: (Types.ObjectId | IShop)[];
	gallery: (Types.ObjectId | IImage)[]; // ✅ Added gallery for user's images
	roles: Role[];
	accountType: AccountType;
	isActive: boolean;
	lastLogin?: Date;
	createdAt: Date;
	updatedAt: Date;

	comparePassword(candidate: string): Promise<boolean>;
	hasRole(role: Role): boolean;
	addRole(role: Role): void;
	removeRole(role: Role): void;
}

const UserSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			minlength: 2,
			maxlength: 50,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
		},
		password: {
			type: String,
			minlength: 6,
			select: false,
		},
		image: String,
		phone: String,
		address: String,
		roles: {
			type: [String],
			enum: Object.values(Role),
			default: [Role.USER],
			index: true,
		},
		shops: [{
			type: Schema.Types.ObjectId,
			ref: "Shop"
		}],
		gallery: [{
			type: Schema.Types.ObjectId,
			ref: "Image"
		}],
		accountType: {
			type: String,
			enum: Object.values(AccountType),
			default: AccountType.FREEMIUM,
		},
		isActive: { type: Boolean, default: true },
		lastLogin: { type: Date, default: null },
	},
	{
		timestamps: true,
		versionKey: false,
		toJSON: {
			virtuals: true,
			transform: (_, ret) => {
				delete ret.password;
				return ret;
			},
		},
	}
);

// 🔒 Hash password before saving
UserSchema.pre("save", async function (next) {
	if (!this.isModified("password") || !this.password) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

// 🧠 Password comparison
UserSchema.methods.comparePassword = async function (candidate: string) {
	if (!this.password) return false;
	return bcrypt.compare(candidate, this.password);
};

// 🧩 Role management methods
UserSchema.methods.hasRole = function (role: Role): boolean {
	return this.roles.includes(role);
};

UserSchema.methods.addRole = function (role: Role) {
	if (!this.roles.includes(role)) this.roles.push(role);
};

UserSchema.methods.removeRole = function (role: Role) {
	this.roles = this.roles.filter((r: Role) => r !== role);
};

// 🚀 Export
export const User = models.User || model<IUser>("User", UserSchema);












