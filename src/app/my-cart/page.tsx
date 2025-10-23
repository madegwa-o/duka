'use client'

import {useEffect, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { User, Phone, MapPin, Trash2, ShoppingBag, Store } from 'lucide-react';
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";

interface OwnerContact {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
}

interface CartProduct {
    _id: string;
    name: string;
    description: string;
    price: number;
    images: Array<{ url: string; publicId: string }>;
    category: { _id: string; name: string };
    shop: {
        _id: string;
        name: string;
        description: string;
    };
    ownerContact: OwnerContact;
    createdAt: string;
    updatedAt: string;
}

interface CartResponse {
    success: boolean;
    cart: CartProduct[];
    totalItems: number;
}

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        throw new Error('Failed to fetch cart');
    }
    return res.json();
});

export default function MyCart() {
    const {data: session} = useSession();
    const router = useRouter()
    const [removingId, setRemovingId] = useState<string | null>(null);

    const { data, error, isLoading, mutate } = useSWR<CartResponse>('/api/my-cart', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push(`/signin?callbackUrl=/my-cart`)
        }
    }, [status, router])

    if (status === 'loading' || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mx-auto mb-4"></div>
                    <p className="text-lg text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }


    const cart = data?.cart || [];
    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

    const handleRemoveFromCart = async (productId: string) => {
        setRemovingId(productId);

        try {
            const response = await fetch('/api/my-cart/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId })
            });

            if (!response.ok) {
                throw new Error('Failed to remove item');
            }

            await mutate();
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Failed to remove item from cart');
        } finally {
            setRemovingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                    <p className="text-lg text-muted-foreground">Loading your cart...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="bg-destructive/10 border border-destructive rounded-lg p-6 max-w-md w-full">
                    <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
                    <p className="text-muted-foreground mb-4">{error.message || 'An error occurred while loading your cart'}</p>
                    <button
                        onClick={() => mutate()}
                        className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
                    <p className="text-muted-foreground mb-6">Start adding products to your cart to see them here.</p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        My Cart
                    </h1>
                    <p className="text-muted-foreground">
                        {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {cart.map((product) => (
                            <div key={product._id} className="bg-card border border-border rounded-lg overflow-hidden card-hover">
                                <div className="md:flex">
                                    {/* Product Image */}
                                    <div className="md:w-1/3 relative h-64 md:h-auto min-h-[250px]">
                                        {product.images && product.images.length > 0 ? (
                                            <Image
                                                src={`/api/r2/images/${encodeURIComponent(product.images[0].url)}`}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="md:w-2/3 p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h2 className="text-2xl font-bold text-foreground mb-2">{product.name}</h2>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                                    <Store className="h-4 w-4" />
                                                    <span>{product.shop.name}</span>
                                                    <span>•</span>
                                                    <span>{product.category.name}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFromCart(product._id)}
                                                disabled={removingId === product._id}
                                                className="ml-4 p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                                                title="Remove from cart"
                                            >
                                                {removingId === product._id ? (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-destructive"></div>
                                                ) : (
                                                    <Trash2 className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>

                                        <p className="text-2xl font-bold text-accent mb-4">
                                            sh{product.price.toFixed(2)}
                                        </p>

                                        <p className="text-muted-foreground mb-6 line-clamp-2">{product.description}</p>

                                        {/* Owner Contact Details */}
                                        <div className="bg-muted rounded-lg p-4 border border-border">
                                            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                <User className="h-4 w-4 text-accent" />
                                                Seller Contact
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                {product.ownerContact.name && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-foreground">Name:</span>
                                                        <span className="text-muted-foreground">{product.ownerContact.name}</span>
                                                    </div>
                                                )}
                                                {product.ownerContact.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-secondary" />
                                                        <a
                                                            href={`tel:${product.ownerContact.phone}`}
                                                            className="text-secondary hover:underline"
                                                        >
                                                            {product.ownerContact.phone}
                                                        </a>
                                                    </div>
                                                )}
                                                {product.ownerContact.address && (
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                        <span className="text-muted-foreground">{product.ownerContact.address}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cart Summary - Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
                            <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal ({cart.length} items)</span>
                                    <span>sh{totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-border pt-3">
                                    <div className="flex justify-between text-lg font-bold text-foreground">
                                        <span>Total</span>
                                        <span className="text-accent">sh{totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    className="w-full px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                                >
                                    Proceed to Checkout
                                </button>
                                <Link
                                    href="/"
                                    className="block w-full px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium text-center"
                                >
                                    Continue Shopping
                                </Link>
                            </div>

                            <div className="mt-6 pt-6 border-t border-border">
                                <p className="text-sm text-muted-foreground text-center">
                                    Contact sellers directly for payment and delivery arrangements
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}