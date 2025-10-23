"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, ArrowRight, Sparkles } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Image from 'next/image'

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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
                <div className="relative">
                    <div className="absolute inset-0 blur-3xl bg-accent/20 rounded-full animate-pulse"></div>
                    <Loader2 className="h-8 w-8 animate-spin text-accent relative z-10" />
                </div>
            </div>
        )
    }

    if (session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
                <div className="text-center">
                    <div className="relative inline-block mb-4">
                        <div className="absolute inset-0 blur-2xl bg-accent/30 rounded-full animate-pulse"></div>
                        <Loader2 className="h-8 w-8 animate-spin text-accent relative z-10 mx-auto" />
                    </div>
                    <p className="text-sm text-muted-foreground animate-pulse">Redirecting to your store...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 px-4 py-8">
            {/* Logo background pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
                    style={{
                        backgroundImage: 'url(/logo.png)',
                        backgroundSize: '80% 80%',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                ></div>
            </div>


            <div className="relative z-10 flex items-center justify-center min-h-screen">
                <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Logo & Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                            Welcome Back
                        </h1>
                        <p className="text-base text-muted-foreground">Sign in to access your Duka store</p>
                    </div>

                    {/* Main Card with glassmorphism */}
                    <Card className="border border-border/50 shadow-2xl shadow-black/5 backdrop-blur-xl bg-card/80 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: '100ms' }}>
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] to-transparent pointer-events-none"></div>

                        <CardContent className="relative pt-8 pb-8 px-8">
                            {error && (
                                <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/30 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-sm">{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Google Sign In */}
                            <Button
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:bg-white/10 dark:text-white dark:border-white/20 dark:hover:bg-white/20 dark:backdrop-blur-xl group"
                                variant="outline"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <svg className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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
                                        Continue with Google
                                    </>
                                )}
                            </Button>

                            {/* Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border/60"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-card px-4 py-1 text-muted-foreground uppercase tracking-wider font-medium rounded-full">
                                        Or continue with email
                                    </span>
                                </div>
                            </div>

                            {/* Email/Password Form */}
                            <form onSubmit={handleCredentialsSignIn} className="space-y-5">
                                <div className="space-y-2 group">
                                    <Label htmlFor="email" className="text-sm font-medium text-foreground/90">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isCredentialsLoading}
                                            className="h-12 bg-background/50 border-border/60 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200 pl-4 backdrop-blur-sm hover:bg-background/80"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 group">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-sm font-medium text-foreground/90">
                                            Password
                                        </Label>
                                        <button
                                            type="button"
                                            className="text-xs text-accent hover:text-accent/80 font-medium transition-colors"
                                        >
                                            Forgot?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isCredentialsLoading}
                                            className="h-12 bg-background/50 border-border/60 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200 pl-4 backdrop-blur-sm hover:bg-background/80"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isCredentialsLoading}
                                    className="w-full h-12 bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-white font-semibold shadow-lg shadow-accent/25 transition-all duration-200 hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] group mt-6"
                                >
                                    {isCredentialsLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="mt-8 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
                        <p className="text-sm text-muted-foreground">
                            New to Duka?{" "}
                            <button className="text-accent hover:text-accent/80 font-semibold transition-colors hover:underline underline-offset-4">
                                Just Continue with Google
                            </button>
                        </p>

                        <div className="pt-6 border-t border-border/50">
                            <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-sm mx-auto">
                                By continuing, you agree to Duka&#39;s{" "}
                                <a href="#" className="text-foreground/60 hover:text-accent transition-colors underline underline-offset-2">
                                    Terms of Service
                                </a>
                                {" "}and{" "}
                                <a href="#" className="text-foreground/60 hover:text-accent transition-colors underline underline-offset-2">
                                    Privacy Policy
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}