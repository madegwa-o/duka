// app/api/auth/[...nextauth]/route.ts
import Google from "next-auth/providers/google";
import { addOrUpdateUser, getUserByEmail } from "@/lib/users";
import NextAuth, { DefaultSession } from "next-auth";

// Extend the NextAuth types to include roles
declare module "next-auth" {
    interface Session {
        user: {
            id?: string | null;
            roles?: string[];
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        roles?: string[];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userId?: string;
        roles?: string[];
    }
}

const handler = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                if (account?.provider === "google" && user.email && user.name) {
                    await addOrUpdateUser({
                        name: user.name,
                        email: user.email,
                        image: user.image ?? undefined,
                        roles: ["tenant"], // Default role for new users
                    });
                }
                return true;
            } catch (error) {
                console.error("Sign in error:", error);
                return false;
            }
        },
        async jwt({ token, user, account, profile, trigger }) {
            // This runs on initial signin and when token is refreshed
            // The 'update' trigger allows us to refresh the token programmatically
            if (user?.email || trigger === "update") {
                try {
                    const email = user?.email || token.email;
                    if (email) {
                        const existingUser = await getUserByEmail(email);
                        if (existingUser) {
                            token.roles = existingUser.roles || ["tenant"];
                            token.userId = existingUser.id;
                            token.name = existingUser.name;
                            token.picture = existingUser.image;
                        }
                    }
                } catch (error) {
                    console.error("JWT callback error:", error);
                }
            }
            return token;
        },
        async session({ session, token }) {
            try {
                if (token?.userId) {
                    session.user.id = token.userId;
                    session.user.roles = token.roles as string[] || ["tenant"];
                    session.user.name = token.name;
                    session.user.image = token.picture;
                }
                return session;
            } catch (error) {
                console.error("Session callback error:", error);
                return session;
            }
        },
    },
    pages: {
        signIn: '/',
        error: '/',
    },
    debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };