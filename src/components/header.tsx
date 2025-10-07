'use client'

import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {useNotifications} from "@/components/notifications/notification-context";
import {useNetworkStatus} from "@/hooks/useNetworkStatus";

export default function Header() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const { addNotification } = useNotifications();
    const isOnline = useNetworkStatus();
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }

        // Only add listener when menu is open
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    // Enhanced sign-in handler with error handling
    const handleSignIn = async () => {
        if (session) {
            addNotification({
                type: "info",
                title: "Already signed in",
                message: `You’re already signed in as ${session.user?.email}`,
                duration: 4000,
            });
            return;
        }

        if (!isOnline) {
            addNotification({
                type: 'warning',
                title: 'No Internet Connection',
                message: 'Please check your internet connection and try again.',
                duration: 5000,
            });
            return;
        }

        try {
            // Show loading notification
            addNotification({
                type: 'info',
                title: 'Signing In',
                message: 'Please wait while we connect to Google...',
                duration: 3000,
            });

            await signIn("google");
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Sign-in Failed',
                message: 'An unexpected error occurred. Please try again.',
                duration: 5000,
                actions: [
                    {
                        label: 'Retry',
                        onClick: () => handleSignIn()
                    }
                ]
            });
            console.error(error);
        }
    };


    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            setIsDarkMode(true);
            document.documentElement.setAttribute('data-theme', 'dark');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            setIsDarkMode(false);
            document.documentElement.setAttribute('data-theme', 'light');
            document.documentElement.style.colorScheme = 'light';
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);

        if (newTheme) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.documentElement.style.colorScheme = 'dark';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.documentElement.style.colorScheme = 'light';
            localStorage.setItem('theme', 'light');
        }
    };

    const navigationItems = [
        { label: "Buy", href: "/" },
        { label: "My Cart", href: "/my-cart" },
        { label: "My Shop", href: "/my-shop" }
    ];


    return (
        <header  ref={menuRef}
                 className="sticky top-0 z-50 w-full border-b backdrop-blur-lg"
                 style={{
                     borderColor: 'var(--header-border)',
                     backgroundColor: 'var(--header-bg)'
                 }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="font-sans text-2xl font-medium tracking-tight text-foreground">
                            Duka
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navigationItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="font-medium transition-colors duration-200 hover:opacity-80"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    {/* Desktop Actions & User Section */}
                    <div className="hidden md:flex items-center gap-2">
                        {/* Actions Section */}
                        <div className="flex items-center gap-1 mr-2">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg transition-all duration-200 hover:opacity-80"
                                style={{ color: 'var(--text-secondary)' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--button-hover)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                                aria-label="Toggle theme"
                            >
                                {isDarkMode ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>

                            {/* Notifications */}
                            <button
                                className="p-2 rounded-lg transition-all duration-200 hover:opacity-80"
                                style={{ color: 'var(--text-secondary)' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--button-hover)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                                aria-label="Notifications"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                        </div>

                        {/* User Section */}
                        {session ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    {session?.user?.image ? (
                                        <Image
                                            src={session.user.image}
                                            alt="avatar"
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 rounded-full ring-2"
                                            style={{
                                                '--tw-ring-color': 'var(--ring-color)'
                                            } as React.CSSProperties}
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                            {session?.user?.name?.charAt(0) ?? "G"}
                                        </div>
                                    )}
                                    <div className="text-sm">
                                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {session?.user?.name ?? "Guest"}
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                            {session?.user?.email ?? "Not signed in"}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200"
                                    style={{
                                        color: 'var(--text-secondary)',
                                        borderColor: 'var(--button-border)',
                                        backgroundColor: 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--button-hover)';
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                    }}
                                    onClick={() => signOut()}
                                >
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <button
                                className="px-4 py-2 text-sm font-medium color-text-primary rounded-lg border transition-all duration-200"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    borderColor: 'rgba(255, 255, 255, 0.1)',

                                }}

                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onClick={() => handleSignIn()}
                            >
                                Sign in
                            </button>
                        )}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button
                        className="md:hidden relative p-1 rounded-xl transition-all duration-200 group"
                        style={{ backgroundColor: 'var(--surface-hover)' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--button-hover)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                        }}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className="flex items-center gap-2">
                            {/* User Avatar/Initial - Always visible when menu is closed */}
                            <div className={`transition-all duration-300 ${isMenuOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                                {session ? (
                                    <>
                                        {session?.user?.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt="avatar"
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full ring-2 transition-all duration-200"
                                                style={{
                                                    '--tw-ring-color': 'var(--ring-color)'
                                                } as React.CSSProperties}
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium ring-2 transition-all duration-200 group-hover:scale-110"
                                                 style={{
                                                     '--tw-ring-color': 'var(--ring-color)'
                                                 } as React.CSSProperties}>
                                                {session?.user?.name?.charAt(0) ?? "G"}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-medium ring-2 transition-all duration-200 group-hover:scale-110"
                                         style={{
                                             '--tw-ring-color': 'var(--ring-color)'
                                         } as React.CSSProperties}>
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Three dashes indicator - visible when menu is closed */}
                            <div className={`flex flex-col gap-1 transition-all duration-300 ${isMenuOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                                <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: 'var(--text-secondary)' }}></div>
                                <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: 'var(--text-secondary)' }}></div>
                                <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: 'var(--text-secondary)' }}></div>
                            </div>

                            {/* Hamburger/Close Icon - Overlays on menu open */}
                            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isMenuOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                                     style={{ backgroundColor: 'var(--surface-secondary)' }}>
                                    <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }}
                                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Active indicator dot */}
                        {session && !isMenuOpen && (
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 animate-pulse"
                                 style={{
                                     backgroundColor: 'var(--success)',
                                     borderColor: 'var(--background)'
                                 }}></div>
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`md:hidden transition-all duration-300 ease-in-out ${
                    isMenuOpen
                        ? 'max-h-96 opacity-100 pb-6'
                        : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                    <div className="pt-4 space-y-2">
                        {navigationItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="block px-3 py-2 text-base font-medium rounded-lg transition-all duration-200"
                                style={{ color: 'var(--text-secondary)' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--button-hover)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.label}
                            </a>
                        ))}

                        {/* Mobile Actions */}
                        <div className="px-3 py-2 border-t mt-4 pt-4"
                             style={{ borderColor: 'var(--border)' }}>
                            <div className="flex items-center gap-4 mb-4">
                                <button
                                    onClick={toggleTheme}
                                    className="flex items-center gap-2 px-3 py-2 text-base font-medium rounded-lg transition-all duration-200"
                                    style={{ color: 'var(--text-secondary)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--button-hover)';
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                    }}
                                >
                                    {isDarkMode ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            Light Mode
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                            </svg>
                                            Dark Mode
                                        </>
                                    )}
                                </button>
                                <button
                                    className="flex items-center gap-2 px-3 py-2 text-base font-medium rounded-lg transition-all duration-200"
                                    style={{ color: 'var(--text-secondary)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--button-hover)';
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                    }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    Notifications
                                </button>
                            </div>
                        </div>

                        <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                            {session ? (
                                <div className="space-y-3 pt-4">
                                    <div className="flex items-center gap-3 px-3 py-2">
                                        {session?.user?.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt="avatar"
                                                width={40}
                                                height={40}
                                                className="w-10 h-10 rounded-full ring-2"
                                                style={{
                                                    '--tw-ring-color': 'var(--ring-color)'
                                                } as React.CSSProperties}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                                {session?.user?.name?.charAt(0) ?? "G"}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                                {session?.user?.name ?? "Guest"}
                                            </div>
                                            <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                                {session?.user?.email ?? "Not signed in"}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="w-full text-left px-3 py-2 text-base font-medium rounded-lg transition-all duration-200"
                                        style={{ color: 'var(--text-secondary)' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--button-hover)';
                                            e.currentTarget.style.color = 'var(--text-primary)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = 'var(--text-secondary)';
                                        }}
                                        onClick={() => {
                                            signOut();
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        Sign out
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-4">
                                    <button
                                        className="w-full px-3 py-2 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                                        onClick={() => {
                                            handleSignIn();
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        Sign in with Google
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );

}