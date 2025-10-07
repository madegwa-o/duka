'use client'

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignInPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Handle hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    // Redirect authenticated users to /images
    useEffect(() => {
        if (status === "authenticated" && session) {
            router.push("/dashboard");
        }
    }, [session, status, router]);

    const handleSignIn = async (provider: string) => {
        setIsLoading(true);
        try {
            await signIn(provider, { callbackUrl: "/images" });
        } catch (error) {
            console.error("Sign in error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading spinner during authentication check
    if (!mounted || status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If user is authenticated, show a brief loading state before redirect
    if (session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Redirecting to chat...</p>
                </div>
            </div>
        );
    }

    // Main sign-in page for unauthenticated users
    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Side - Hero Section */}
            <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_25%,rgba(255,255,255,.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,.1)_75%)] bg-[length:20px_20px]"></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 flex flex-col justify-center h-full px-8 lg:px-16 py-16">
                    <div className="max-w-xl">
                        {/* Logo */}
                        <div className="mb-8">
                            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                                Paysuit
                            </h1>
                            <div className="w-20 h-1 bg-white/30 rounded-full"></div>
                        </div>

                        {/* Hero Text */}
                        <h2 className="text-2xl lg:text-3xl font-semibold text-white mb-6 leading-tight">
                            Accept payments anywhere with Paysuit
                        </h2>
                        <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                            Secure API keys, M-Pesa integrations, and a clean developer dashboard.
                        </p>

                        {/* Features */}
                        <div className="space-y-4">
                            {[
                                "🔑 API key management",
                                "📲 STK Push & QR payments",
                                "💸 B2C disbursements",
                                "📈 Transaction analytics"
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center text-white/90">
                                    <span className="text-lg mr-3">{feature.split(' ')[0]}</span>
                                    <span className="font-medium">{feature.substring(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Right Side - Sign In Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-white dark:bg-gray-900">
                <div className="w-full max-w-md">
                    {/* Sign In Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Welcome back
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Sign in to continue your learning journey
                            </p>
                        </div>

                        {/* Sign In Buttons */}
                        <div className="space-y-4">
                            {/* Google Sign In */}
                            <button
                                onClick={() => handleSignIn("google")}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                                ) : (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                )}
                                <span className="font-medium">
                                    {isLoading ? "Signing in..." : "Continue with Google"}
                                </span>
                            </button>

                        </div>

                        {/* Terms */}
                        <p className="mt-8 text-xs text-center text-gray-500 dark:text-gray-400">
                            By continuing, you agree to our{" "}
                            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                            {" "}and{" "}
                            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                        </p>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            New to KaruExams?{" "}
                            <span className="text-blue-600 font-medium">
                                Get started for free!
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}