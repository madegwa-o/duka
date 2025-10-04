"use client";

import { useEffect, useState } from "react";

// Define types for the PWA install event
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            // Narrow type to our custom event
            const promptEvent = e as BeforeInstallPromptEvent;
            promptEvent.preventDefault();
            setDeferredPrompt(promptEvent);
            setVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            console.log("✅ User accepted install");
        } else {
            console.log("❌ User dismissed install");
        }

        setDeferredPrompt(null);
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <button
            onClick={handleInstall}
            className="fixed bottom-6 right-6 px-4 py-2 bg-black text-white rounded-lg shadow-lg hover:bg-gray-800 transition"
        >
            Install App
        </button>
    );
}
