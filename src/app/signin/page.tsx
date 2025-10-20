"use client"

import { signIn, useSession } from "next-auth/react"
import {useRouter, useSearchParams} from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, ArrowRight } from "lucide-react"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function SignInPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [isCredentialsLoading, setIsCredentialsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const callbackUrl = searchParams.get("callbackUrl") || "/"

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (status === "authenticated" && session) {
            router.push(callbackUrl)
        }
    }, [session, status, router, callbackUrl])

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        setError(null)
        try {
            await signIn("google", { callbackUrl })
        } catch (error) {
            console.error("Sign in error:", error)
            setError("Failed to sign in with Google. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCredentialsSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCredentialsLoading(true)
        setError(null)

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError("Invalid email or password. Please try again.")
            } else if (result?.ok) {
                router.push(callbackUrl)
            }
        } catch (error) {
            console.error("Sign in error:", error)
            setError("An error occurred. Please try again.")
        } finally {
            setIsCredentialsLoading(false)
        }
    }

    if (!mounted || status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-foreground" />
            </div>
        )
    }

    if (session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Redirecting...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
            <div className="w-full max-w-[400px]">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-[28px] font-semibold tracking-tight text-foreground mb-2">Duka</h1>
                    <p className="text-sm text-muted-foreground">Log in to your store</p>
                </div>

                {/* Main Card */}
                <Card className="border border-border shadow-sm">
                    <CardContent className="pt-6 pb-8 px-6">
                        {error && (
                            <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/30">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-sm">{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Google Sign In */}
                        <Button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-none h-11 font-medium dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:hover:bg-gray-800"
                            variant="outline"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-card px-2 text-muted-foreground uppercase tracking-wide">Or</span>
                            </div>
                        </div>

                        {/* Email/Password Form */}
                        <form onSubmit={handleCredentialsSignIn} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isCredentialsLoading}
                                    className="h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-400 focus:ring-0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isCredentialsLoading}
                                    className="h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-400 focus:ring-0"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isCredentialsLoading}
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11 font-medium shadow-none dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                            >
                                {isCredentialsLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        Continue
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer Text */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        New to Duka?{" "}
                        <button className="text-foreground underline hover:no-underline font-medium">
                            Get started
                        </button>
                    </p>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-6 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground">
                        By continuing, you agree to Duka&#39;s{" "}
                        <a href="#" className="underline hover:no-underline">Terms of Service</a>
                        {" "}and{" "}
                        <a href="#" className="underline hover:no-underline">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
}