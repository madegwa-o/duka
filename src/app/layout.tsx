import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";
import Header from "@/components/header";
import {AuthProvider} from "@/components/auth-provider";
import { Analytics } from "@vercel/analytics/next"
import { NotificationDisplay } from "@/components/notifications/notification-display";
import AuthErrorHandlerWrapper from "@/components/auth-error-handler-wrapper";
import MobileBottomNav from "@/components/MobileBottomNav";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export const metadata: Metadata = {
    title: "DUKA",
    description: "Come shop",
    generator: "Next.js",
    manifest: "/manifest.json",
    keywords: ["property management", "tenant management", "rent collection", "Kenya"],
    authors: [
        { name: "Duka Karu" }
    ],
    icons: [
        { rel: "apple-touch-icon", url: "/logo.png" },
        { rel: "icon", url: "/logo.png" },
    ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <AuthProvider>
          <Header />
          {children}
          <NotificationDisplay />
          <AuthErrorHandlerWrapper />
      </AuthProvider>
      <InstallPrompt />
      <Analytics />
      <MobileBottomNav />
      </body>
    </html>
  );
}
