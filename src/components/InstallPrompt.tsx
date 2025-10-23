"use client";

import { useEffect, useState } from "react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";
import { X, Bell } from "lucide-react";
import Image from "next/image";

// Define types for the PWA install event
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const { isSupported, isSubscribed, subscribeToPush } = usePushNotifications();

    useEffect(() => {
        // Check if already installed/running as PWA
        const isInStandaloneMode =
            window.matchMedia('(display-mode: standalone)').matches ||
            ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone) ||
            document.referrer.includes('android-app://');

        setIsStandalone(isInStandaloneMode);

        const handler = (e: Event) => {
            const promptEvent = e as BeforeInstallPromptEvent;
            promptEvent.preventDefault();
            setDeferredPrompt(promptEvent);

            // Check if user has already dismissed the install prompt (moved inside handler)
            const hasSeenInstallPrompt = sessionStorage.getItem('pwa-install-prompt-dismissed');

            // Only show if user hasn't dismissed it before
            if (!hasSeenInstallPrompt) {
                setShowInstallPrompt(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    // Check for notification permission after app is installed
    useEffect(() => {
        if (isStandalone && isSupported && !isSubscribed) {
            const hasAskedForNotifications = sessionStorage.getItem('notification-prompt-shown');

            if (!hasAskedForNotifications && Notification.permission === 'default') {
                // Show notification prompt after a short delay
                setTimeout(() => {
                    setShowNotificationPrompt(true);
                }, 2000);
            }
        }
    }, [isStandalone, isSupported, isSubscribed]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            console.log("✅ User accepted install");

            // After installation, check if we should ask for notifications
            setTimeout(() => {
                if (isSupported && !isSubscribed && Notification.permission === 'default') {
                    setShowNotificationPrompt(true);
                }
            }, 1000);
        } else {
            console.log("❌ User dismissed install");
        }

        setDeferredPrompt(null);
        setShowInstallPrompt(false);
        sessionStorage.setItem('pwa-install-prompt-dismissed', 'true');
    };

    const handleDismissInstall = () => {
        setShowInstallPrompt(false);
        sessionStorage.setItem('pwa-install-prompt-dismissed', 'true');
    };

    const handleEnableNotifications = async () => {
        try {
            await subscribeToPush();
            setShowNotificationPrompt(false);
            sessionStorage.setItem('notification-prompt-shown', 'true');
        } catch (error) {
            console.error('Failed to enable notifications:', error);
        }
    };

    const handleDismissNotifications = () => {
        setShowNotificationPrompt(false);
        localStorage.setItem('notification-prompt-shown', 'true');
    };

    // Show Install Prompt
    if (showInstallPrompt && deferredPrompt) {
        return (
            <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-10000 animate-in slide-in-from-bottom-5">
                <div className="bg-card border-border rounded-lg shadow-lg border p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/android-chrome-192x192.png"
                                alt="Duka"
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-lg"
                            />

                            <div>
                                <h3 className="font-semibold text-card-foreground">Install Duka</h3>
                                <p className="text-sm text-muted-foreground">Get quick access to your shop</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismissInstall}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleInstallClick} className="flex-1">
                            Install App
                        </Button>
                        <Button onClick={handleDismissInstall} variant="outline">
                            Not Now
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Show Notification Prompt
    if (showNotificationPrompt) {
        return (
            <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-10000 animate-in slide-in-from-bottom-5">
                <div className="bg-card border-border rounded-lg shadow-lg border p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-accent/10 p-2 rounded-lg">
                                <Bell className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-card-foreground">Get Notified</h3>
                                <p className="text-sm text-muted-foreground">We&#39;ll let you know when we see potential clients</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismissNotifications}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleEnableNotifications} className="flex-1">
                            <Bell className="h-4 w-4 mr-2" />
                            Enable
                        </Button>
                        <Button onClick={handleDismissNotifications} variant="outline">
                            Skip
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return null
}