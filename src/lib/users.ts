// ============================================
// lib/users.ts
// ============================================
import { connectToDatabase } from "@/lib/db";
import { User, Role, IUser } from "@/models/User";



export type AppUser = {
    id: string;
    name: string;
    email: string;
    image?: string;
    roles: Role[];
};

function mapUser(user: IUser): AppUser {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        roles: user.roles,
    };
}

// ✅ Find user by email
export async function getUserByEmail(email: string): Promise<AppUser | null> {
    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase() });
    return user ? mapUser(user) : null;
}


// ✅ Add or update user — only updating lastLogin if user exists
export async function addOrUpdateUser(data: {
    name: string;
    email: string;
    image?: string;
    roles?: Role[];
    lastLogin: Date;
}): Promise<AppUser> {
    await connectToDatabase();

    const existingUser = await User.findOne({ email: data.email.toLowerCase() });

    if (existingUser) {
        // ✅ Just update lastLogin
        existingUser.lastLogin = data.lastLogin;
        await existingUser.save();
        return mapUser(existingUser);
    }

    // ✅ If new user, create one
    const newUser = await User.create({
        name: data.name,
        email: data.email.toLowerCase(),
        image: data.image,
        roles: data.roles?.length ? data.roles : [Role.USER],
        lastLogin: data.lastLogin,
    });

    return mapUser(newUser);
}


export async function updateUserPassword(email: string, password: string): Promise<IUser | null> {
    await connectToDatabase()
    const user = await User.findOne({ email })
    if (!user) return null

    user.password = password
    await user.save()
    return user
}