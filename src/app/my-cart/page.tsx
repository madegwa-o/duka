'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';
import useSWR from 'swr';

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

const fetcher = (url: string ) => fetch(url).then(res => {
    if (!res.ok) {
        throw new Error('Failed to fetch cart');
    }
    return res.json();
});

export default function MyCart() {

    const [removingId, setRemovingId] = useState<string | null>(null);

    const { data, error, isLoading, mutate } = useSWR<CartResponse>('/api/my-cart', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
    });

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

            // Revalidate the cart data
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
            <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-muted flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-lg">Loading your cart...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-muted flex items-center justify-center">
                <div className="bg-destructive/10 border border-destructive rounded-lg p-6 max-w-md">
                    <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
                    <p>{error.message || 'An error occurred while loading your cart'}</p>
                    <button
                        onClick={() => mutate()}
                        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-muted py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">My Cart ({cart.length} items)</h1>

                <div className="grid gap-6">
                    {cart.map((product) => (
                        <div key={product._id} className="bg-card rounded-lg shadow-lg overflow-hidden">
                            <div className="md:flex">
                                {/* Product Image */}
                                <div className="md:w-1/3 relative h-64 md:h-auto">
                                    {product.images && product.images.length > 0 ? (
                                        <Image
                                            src={`/api/r2/images/${encodeURIComponent(product.images[0].url)}`}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <span className="text-muted-foreground">No image</span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Details */}
                                <div className="md:w-2/3 p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {product.shop.name} • {product.category.name}
                                            </p>
                                        </div>
                                        <p className="text-2xl font-bold text-primary">
                                            sh{product.price.toFixed(2)}
                                        </p>
                                    </div>

                                    <p className="text-muted-foreground mb-6">{product.description}</p>

                                    {/* Owner Contact Details */}
                                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Seller Contact
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                                            {product.ownerContact.name && (
                                                <div>
                                                    <span className="font-medium">Name:</span>{' '}
                                                    <span className="text-muted-foreground">{product.ownerContact.name}</span>
                                                </div>
                                            )}
                                            {product.ownerContact.phone && (
                                                <div>
                                                    <span className="font-medium">Phone:</span>{' '}
                                                    <a href={`tel:${product.ownerContact.phone}`} className="text-primary hover:underline">
                                                        {product.ownerContact.phone}
                                                    </a>
                                                </div>
                                            )}
                                            {product.ownerContact.address && (
                                                <div>
                                                    <span className="font-medium">Address:</span>{' '}
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

                {/* Cart Summary */}
                <div className="mt-8 bg-card rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total:</span>
                        <span className="text-primary">sh{totalPrice.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}