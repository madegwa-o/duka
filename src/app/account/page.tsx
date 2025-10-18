"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { User, CreditCard, History, Settings, Bell, Shield, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import {usePushNotifications} from "@/hooks/use-push-notifications";

export default function AccountPage() {
    const { data: session, status } = useSession()
    const { isSupported, isSubscribed, subscribeToPush, unsubscribeFromPush } = usePushNotifications();
    const router = useRouter()
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
    const [isSettingPassword, setIsSettingPassword] = useState(false)
    const [isProcessingPush, setIsProcessingPush] = useState(false);


    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/signin?callbackUrl=/account")
        }
    }, [status, router])

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordError(null)
        setPasswordSuccess(null)

        if (newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters")
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match")
            return
        }

        setIsSettingPassword(true)

        try {
            const response = await fetch("/api/user/set-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPassword }),
            })

            const data = await response.json()

            if (!response.ok) {
                setPasswordError(data.error || "Failed to set password")
            } else {
                setPasswordSuccess("Password set successfully! You can now sign in with email and password.")
                setNewPassword("")
                setConfirmPassword("")
            }
        } catch (error) {
            console.error("Password setup error:", error)
            setPasswordError("An error occurred. Please try again.")
        } finally {
            setIsSettingPassword(false)
        }
    }


    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!session) {
        return null
    }

    const consultationHistory = [
        {
            id: 1,
            date: "2025-01-10",
            topic: "Headache and fever symptoms",
            recommendation: "Primary Care Physician",
        },
        {
            id: 2,
            date: "2025-01-08",
            topic: "Skin rash on arm",
            recommendation: "Dermatologist",
        },
        {
            id: 3,
            date: "2025-01-05",
            topic: "Lower back pain",
            recommendation: "Physical Therapist",
        },
    ]

     const handleToggle = async (checked: boolean) => {
        setIsProcessingPush(true);
        try {
            if (checked) {
                await subscribeToPush();
            } else {
                await unsubscribeFromPush();
            }
        } catch (err) {
            console.error("Notification toggle error:", err);
        } finally {
            setIsProcessingPush(false);
        }
    }


    return (
        <main className="container px-4 py-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="font-bold text-3xl mb-2">My Account</h1>
                <p className="text-muted-foreground">Manage your profile, subscription, and consultation history.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="subscription">Subscription</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile Information
                            </CardTitle>
                            <CardDescription>Update your personal information and contact details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" defaultValue={session.user?.name || ""} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" defaultValue={session.user?.email || ""} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                            </div>
                            <Button>Save Changes</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Set Up Password
                            </CardTitle>
                            <CardDescription>
                                Set up a password to enable email/password sign-in as an alternative to Google OAuth.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {passwordError && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertDescription>{passwordError}</AlertDescription>
                                </Alert>
                            )}
                            {passwordSuccess && (
                                <Alert className="mb-4 border-primary bg-primary/10">
                                    <AlertDescription className="text-primary">{passwordSuccess}</AlertDescription>
                                </Alert>
                            )}
                            <form onSubmit={handleSetPassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        placeholder="At least 6 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        disabled={isSettingPassword}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        placeholder="Re-enter your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={isSettingPassword}
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={isSettingPassword}>
                                    {isSettingPassword ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Setting Password...
                                        </>
                                    ) : (
                                        "Set Password"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="subscription" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Current Plan
                            </CardTitle>
                            <CardDescription>Manage your subscription and billing information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-lg">{ "Plus"} Plan</h3>
                                    <p className="text-muted-foreground text-sm">$19/month</p>
                                </div>
                                <Button variant="outline" className="bg-transparent">
                                    Change Plan
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold">Usage This Month</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="p-4 border rounded-lg">
                                        <p className="text-muted-foreground text-sm mb-1">Consultations</p>
                                        <p className="font-semibold text-2xl">{12}</p>
                                        <p className="text-muted-foreground text-xs">Unlimited</p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <p className="text-muted-foreground text-sm mb-1">Image Scans</p>
                                        <p className="font-semibold text-2xl">{ 3} / 10</p>
                                        <p className="text-muted-foreground text-xs">Resets monthly</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold">Payment Method</h3>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-14 bg-muted rounded flex items-center justify-center">
                                            <span className="font-mono text-xs">VISA</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">•••• •••• •••• 4242</p>
                                            <p className="text-muted-foreground text-xs">Expires 12/26</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="bg-transparent">
                                        Update
                                    </Button>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <Button variant="destructive" className="bg-transparent" size="sm">
                                    Cancel Subscription
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Consultation History
                            </CardTitle>
                            <CardDescription>View your past consultations and recommendations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {consultationHistory.map((consultation) => (
                                    <div key={consultation.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold">{consultation.topic}</h3>
                                            <span className="text-muted-foreground text-xs">{consultation.date}</span>
                                        </div>
                                        <p className="text-muted-foreground text-sm mb-3">Recommended: {consultation.recommendation}</p>
                                        <Button variant="outline" size="sm" className="bg-transparent">
                                            View Details
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full mt-4 bg-transparent">
                                Load More
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notifications
                            </CardTitle>
                            <CardDescription>Manage how you receive notifications from Kia.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="email-notifications">Email Notifications</Label>
                                    <p className="text-muted-foreground text-sm">Receive consultation summaries and health tips</p>
                                </div>
                                <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="push-notifications">Push Notifications</Label>
                                    {!isSupported ? (
                                        <p className="text-muted-foreground text-sm">
                                            Push notifications not supported on this device.
                                        </p>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">
                                            {isSubscribed
                                                ? "You're subscribed to receive important health updates."
                                                : "Get alerts for important health updates."}
                                        </p>
                                    )}
                                </div>

                                {isProcessingPush ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                ) : (
                                    <Switch
                                        id="push-notifications"
                                        disabled={!isSupported}
                                        checked={isSubscribed}
                                        onCheckedChange={handleToggle}
                                    />
                                )}

                            </div>

                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Preferences
                            </CardTitle>
                            <CardDescription>Customize your Kia experience.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="language">Language</Label>
                                <select
                                    id="language"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option>English</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                    <option>German</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <select
                                    id="timezone"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option>Eastern Time (ET)</option>
                                    <option>Central Time (CT)</option>
                                    <option>Mountain Time (MT)</option>
                                    <option>Pacific Time (PT)</option>
                                </select>
                            </div>
                            <Button>Save Preferences</Button>
                        </CardContent>
                    </Card>

                    <Card className="border-destructive/50">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            <CardDescription>Irreversible actions for your account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm">Delete All Consultation History</p>
                                    <p className="text-muted-foreground text-xs">This action cannot be undone</p>
                                </div>
                                <Button variant="destructive" size="sm" className="bg-transparent">
                                    Delete History
                                </Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm">Delete Account</p>
                                    <p className="text-muted-foreground text-xs">Permanently delete your account and all data</p>
                                </div>
                                <Button variant="destructive" size="sm">
                                    Delete Account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </main>
    )
}
