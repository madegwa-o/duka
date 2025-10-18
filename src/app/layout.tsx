import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Suspense } from "react";
import { AuthProvider } from "@/components/auth-provider";
import { NotificationDisplay } from "@/components/notifications/notification-display";
import AuthErrorHandlerWrapper from "@/components/auth-error-handler-wrapper";
import MobileBottomNav from "@/components/MobileBottomNav";
import InstallPrompt from "@/components/InstallPrompt";

// -----------------
// Font Configuration
// -----------------
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// -----------------
// Viewport (Next.js 15+)
// -----------------
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#F5F5F5" },
        { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
    ],
    colorScheme: "light dark",
};

// -----------------
// Metadata
// -----------------
export const metadata: Metadata = {
    metadataBase: new URL("https://duka.aistartupclub.com"),

    title: {
        default: "Duka — Shop Smart, Sell Fast",
        template: "%s | Duka",
    },
    description:
        "Discover amazing deals and sell your items effortlessly. Duka is your modern marketplace for buying and selling with ease.",

    applicationName: "Duka",
    generator: "Next.js",
    manifest: "/manifest.json",
    keywords: [
        "online marketplace",
        "buy and sell",
        "e-commerce",
        "shopping app",
        "Duka marketplace",
        "sell items online",
        "cheap deals",
        "online shopping",
        "local marketplace",
        "secondhand marketplace",
    ],
    authors: [
        {
            name: "Oscar Madegwa",
            url: "https://madegwa.pages.dev",
        },
    ],
    creator: "Oscar Madegwa",
    publisher: "Duka Marketplace",

    // -----------------
    // Icons
    // -----------------
    icons: {
        icon: [
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        apple: "/apple-touch-icon.png",
        other: [
            {
                rel: "mask-icon",
                url: "/android-chrome-192x192.png",
                color: "#FF6B6B",
            },
        ],
    },

    // -----------------
    // Open Graph
    // -----------------
    openGraph: {
        type: "website",
        url: "https://duka.aistartupclub.com/",
        title: "Duka — Shop Smart, Sell Fast",
        description:
            "Your modern marketplace for buying and selling. Discover great deals, list your items in seconds, and connect with buyers and sellers in your community.",
        siteName: "Duka",
        images: [
            {
                url: "https://duka.aistartupclub.com/logo.png",
                width: 1200,
                height: 630,
                alt: "Duka - Modern Marketplace",
            },
        ],
    },

    // -----------------
    // Twitter Card
    // -----------------
    twitter: {
        card: "summary_large_image",
        title: "Duka — Shop Smart, Sell Fast",
        description:
            "Discover amazing deals and sell your items effortlessly. Your modern marketplace for easy buying and selling.",
        images: ["https://duka.aistartupclub.com/logo.png"],
        creator: "@duka_marketplace",
    },

    // -----------------
    // Additional Metadata
    // -----------------
    category: "shopping",
    alternates: {
        canonical: "https://duka.aistartupclub.com/",
    },
    appleWebApp: {
        capable: true,
        title: "Duka",
        statusBarStyle: "black-translucent",
    },
    formatDetection: { telephone: false },
};

// -----------------
// Root Layout
// -----------------
export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" dir="ltr" suppressHydrationWarning>
        <body className={`font-sans ${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
            <ThemeProvider defaultTheme="system" storageKey="duka-theme">
                <Suspense fallback={null}>
                    <Header />
                    {children}
                    <Analytics />
                </Suspense>

                <NotificationDisplay />
                <AuthErrorHandlerWrapper />
                <InstallPrompt />
                <MobileBottomNav />
            </ThemeProvider>
        </AuthProvider>

        {/* JSON-LD Structured Data for SEO */}
        <Script
            id="structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    name: "Duka",
                    applicationCategory: "ShoppingApplication",
                    operatingSystem: "Web",
                    description:
                        "Modern marketplace platform for buying and selling items locally and online.",
                    url: "https://duka.aistartupclub.com",
                    creator: {
                        "@type": "Organization",
                        name: "Duka Marketplace",
                    },
                    offers: {
                        "@type": "Offer",
                        price: "0",
                        priceCurrency: "USD",
                    },
                    aggregateRating: {
                        "@type": "AggregateRating",
                        ratingValue: "4.8",
                        ratingCount: "1250",
                    },
                }),
            }}
        />
        </body>
        </html>
    );
}