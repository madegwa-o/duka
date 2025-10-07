// lib/users.ts - Updated with roles array support and proper types
import { connectToDatabase } from "@/lib/db";
import { User, type IUser, type UserRole } from "@/models/User";
import { Types } from "mongoose";

export type AppUser = {
    id: string;
    name: string;
    email: string;
    image?: string;
    roles: UserRole[]; // Always use roles array
};

export async function getUserByEmail(email: string): Promise<AppUser | null> {
    try {
        await connectToDatabase();
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) return null;

        return {
            id: (user._id as Types.ObjectId).toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            roles: user.roles || ["tenant"],
        };
    } catch (error) {
        console.error("Error getting user by email:", error);
        return null;
    }
}

export async function addOrUpdateUser(userData: Omit<AppUser, 'id'> & { id?: string }): Promise<AppUser> {
    try {
        await connectToDatabase();

        // Prepare update data with proper typing
        const updateData: {
            name: string;
            email: string;
            image?: string;
            roles?: UserRole[];
        } = {
            name: userData.name,
            email: userData.email.toLowerCase(),
            image: userData.image,
        };

        // Handle roles
        if (userData.roles && userData.roles.length > 0) {
            updateData.roles = userData.roles;
        } else {
            // Default to tenant role if no role specified and user is new
            const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
            if (!existingUser) {
                updateData.roles = ["tenant"];
            }
        }

        const user = await User.findOneAndUpdate(
            { email: userData.email.toLowerCase() },
            updateData,
            {
                upsert: true,
                new: true, // Return the updated document
                runValidators: true
            }
        );

        if (!user) {
            throw new Error("Failed to insert or update user");
        }

        return {
            id: (user._id as Types.ObjectId).toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            roles: user.roles || ["tenant"],
        };
    } catch (error) {
        console.error("Error adding or updating user:", error);
        throw new Error("Failed to insert or update user");
    }
}

// Helper functions for role management
export async function addUserRole(email: string, role: UserRole): Promise<AppUser | null> {
    try {
        await connectToDatabase();

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return null;

        if (!user.hasRole(role)) {
            user.addRole(role);
            await user.save();
        }

        return {
            id: (user._id as Types.ObjectId).toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            roles: user.roles || ["tenant"],
        };
    } catch (error) {
        console.error("Error adding user role:", error);
        return null;
    }
}

export async function removeUserRole(email: string, role: UserRole): Promise<AppUser | null> {
    try {
        await connectToDatabase();

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return null;

        if (user.hasRole(role)) {
            user.removeRole(role);
            // Ensure user always has at least one role
            if (user.roles.length === 0) {
                user.roles = ["tenant"];
            }
            await user.save();
        }

        return {
            id: (user._id as Types.ObjectId).toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            roles: user.roles || ["tenant"],
        };
    } catch (error) {
        console.error("Error removing user role:", error);
        return null;
    }
}

export async function updateUserRoles(email: string, roles: UserRole[]): Promise<AppUser | null> {
    try {
        await connectToDatabase();

        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { roles: roles.length > 0 ? roles : ["tenant"] },
            { new: true }
        );

        if (!user) return null;

        return {
            id: (user._id as Types.ObjectId).toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            roles: user.roles || ["tenant"],
        };
    } catch (error) {
        console.error("Error updating user roles:", error);
        return null;
    }
}