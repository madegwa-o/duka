"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function SignInPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (status === "authenticated" && session) {
            router.push("/")
        }
    }, [session, status, router])

    const handleSignIn = async (provider: string) => {
        setIsLoading(true)
        try {
            await signIn(provider, { callbackUrl: "/" })
        } catch (error) {
            console.error("Sign in error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!mounted || status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Redirecting to your store...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col-reverse lg:flex-row">
            {/* Left Side - Hero Section */}
            <div className="flex-1 relative overflow-hidden bg-surface-secondary">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent_50%)]"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_48%,rgba(0,0,0,0.03)_49%,rgba(0,0,0,0.03)_51%,transparent_52%)] bg-[length:40px_40px]"></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 flex flex-col justify-center h-full px-8 lg:px-16 py-16">
                    <div className="max-w-xl">
                        {/* Logo */}
                        <div className="mb-8">
                            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Duka</h1>
                            <div className="w-20 h-1 bg-foreground/20 rounded-full"></div>
                        </div>

                        {/* Hero Text */}
                        <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-6 leading-tight">
                            Start your online store and reach customers everywhere
                        </h2>
                        <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                            Join thousands of merchants building successful businesses on Duka. Set up your shop, list products, and start selling today.
                        </p>

                        {/* Features */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-foreground"></div>
                                </div>
                                <p className="text-text-secondary">Easy store setup and product management</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-foreground"></div>
                                </div>
                                <p className="text-text-secondary">Secure payments and order tracking</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-foreground"></div>
                                </div>
                                <p className="text-text-secondary">Grow your business with powerful tools</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-foreground/5 rounded-full blur-3xl"></div>
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-foreground/5 rounded-full blur-3xl"></div>
            </div>

            {/* Right Side - Sign In Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-background">
                <div className="w-full max-w-md">
                    {/* Sign In Card */}
                    <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-foreground mb-2">Welcome to Duka</h3>
                            <p className="text-muted-foreground">Sign in to manage your store</p>
                        </div>

                        {/* Sign In Buttons */}
                        <div className="space-y-4">
                            <Button
                                onClick={() => handleSignIn("google")}
                                disabled={isLoading}
                                variant="outline"
                                size="lg"
                                className="w-full flex items-center justify-center gap-3 h-12"
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-foreground"></div>
                                ) : (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                )}
                                <span className="font-medium">{isLoading ? "Signing in..." : "Continue with Google"}</span>
                            </Button>
                        </div>

                        {/* Terms */}
                        <p className="mt-8 text-xs text-center text-muted-foreground">
                            By continuing, you agree to our{" "}
                            <a href="#" className="text-foreground hover:underline">
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a href="#" className="text-foreground hover:underline">
                                Privacy Policy
                            </a>
                        </p>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            New to Duka? <span className="text-foreground font-medium">Set up your store in minutes!</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}