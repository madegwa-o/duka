// models/User.ts - Updated with proper TypeScript interface
import {Schema, model, models, type Model, Document, Types} from "mongoose";

export type UserRole = "landlord" | "tenant";
export interface IUser extends Document {
	_id: Types.ObjectId;
	name: string;
	email: string;
	image?: string;
	roles: UserRole[];
	phone?: string;
	joinedApartments?: Schema.Types.ObjectId[];
	ownedApartments?: Schema.Types.ObjectId[];

	// Replace currentDoor with rentedHouses array
	rentedHouses?: {
		apartment: Schema.Types.ObjectId;
		houseId: Schema.Types.ObjectId;

	}[];

	// Add method signatures to interface
	hasRole(role: UserRole): boolean;
	addRole(role: UserRole): void;
	removeRole(role: UserRole): void;
}

const UserSchema = new Schema<IUser>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		image: { type: String },
		roles: {
			type: [String],
			enum: ["landlord", "tenant"],
			default: ["tenant"] // Default to tenant role
		},
		phone: { type: String },
		joinedApartments: [{ type: Schema.Types.ObjectId, ref: "Apartment" }],
		ownedApartments: [{ type: Schema.Types.ObjectId, ref: "Apartment" }],
		rentedHouses: [
			{
				apartment: { type: Schema.Types.ObjectId, ref: "Apartment" },
				houseId: { type: Schema.Types.ObjectId, ref: "House" },
			}
		],
	},
	{ timestamps: true }
);

// Helper methods
UserSchema.methods.hasRole = function(role: UserRole): boolean {
	return this.roles.includes(role);
};

UserSchema.methods.addRole = function(role: UserRole): void {
	if (!this.hasRole(role)) {
		this.roles.push(role);
	}
};

UserSchema.methods.removeRole = function(role: UserRole): void {
	this.roles = this.roles.filter((r: UserRole) => r !== role);
};

export const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);