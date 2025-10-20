// ============================================
// components/masonry-feeds.tsx
// ============================================
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface PopulatedProduct {
    _id: string;
    name: string;
    price: number;
    shop: {
        _id: string;
        name: string;
    };
    category: {
        _id: string;
        name: string;
    };
    images: Array<{
        _id: string;
        url: string;
        alt?: string;
    }>;
}

interface PaginationData {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// Deterministic height generator based on product ID
const getProductHeight = (productId: string): number => {
    // Use product ID to generate consistent height between 250-450px
    const hash = productId.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const heights = [250, 280, 320, 350, 380, 420, 450];
    return heights[Math.abs(hash) % heights.length];
};

export default function MasonryFeeds() {
    const [products, setProducts] = useState<PopulatedProduct[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    const fetchProducts = async (pageNum: number) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/feeds?page=${pageNum}&limit=20&sortBy=createdAt&sortOrder=desc`);

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();

            console.log('data: ', data);
            setProducts(data.products);
            setPagination(data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(page);
    }, [page]);

    if (loading && products.length === 0) {
        return (
            <div className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3 xl:columns-4">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="break-inside-avoid overflow-hidden rounded-sm bg-muted animate-pulse"
                        style={{ height: `${getProductHeight(String(i))}px` }}
                    >
                        <div className="h-full w-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <p className="text-lg text-destructive">Error: {error}</p>
                    <button
                        onClick={() => fetchProducts(page)}
                        className="mt-4 rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-lg text-muted-foreground">No products found</p>
            </div>
        );
    }

    return (
        <>
            <div className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3 xl:columns-4">
                {products.map((product) => {
                    const height = getProductHeight(product._id);
                    const hasMultipleImages = product.images && product.images.length > 1;

                    return (
                        <div
                            key={product._id}
                            className="group relative break-inside-avoid overflow-hidden rounded-sm bg-card transition-all hover:shadow-lg"
                        >
                            {/* Image ScrollArea - only show if multiple images */}
                            {hasMultipleImages ? (
                                <ScrollArea className="w-full">
                                    <div className="flex gap-0">
                                        {product.images.map((image, idx) => (
                                            <Link
                                                key={image._id}
                                                href={`/shop/${product.shop._id}?product=${product._id}`}
                                                className="relative flex-shrink-0 w-full"
                                            >
                                                <Image
                                                    src={`/api/r2/images/${encodeURIComponent(image.url)}`}
                                                    alt={image.alt || `${product.name} - Image ${idx + 1}`}
                                                    width={300}
                                                    height={height}
                                                    className="w-full transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/10" />
                                            </Link>
                                        ))}
                                    </div>
                                    <ScrollBar orientation="horizontal" className="h-2" />
                                </ScrollArea>
                            ) : (
                                <Link
                                    href={`/shop/${product.shop._id}?product=${product._id}`}
                                    className="relative block"
                                >
                                    <Image
                                        src={`/api/r2/images/${encodeURIComponent(product.images?.[0]?.url || "/placeholder.svg")}`}
                                        alt={product.images?.[0]?.alt || product.name}
                                        width={300}
                                        height={height}
                                        className="w-full transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/10" />
                                </Link>
                            )}

                            {/* Product Info */}
                            <Link
                                href={`/shop/${product.shop._id}?product=${product._id}`}
                                className="block p-4"
                            >
                                <h3 className="font-sans text-sm font-medium text-foreground">
                                    {product.name}
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    sh{product.price.toFixed(2)}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground/70">
                                    {product.shop.name}
                                </p>
                                {hasMultipleImages && (
                                    <p className="mt-1 text-xs text-muted-foreground/50">
                                        {product.images.length} images • Scroll to view →
                                    </p>
                                )}
                            </Link>
                        </div>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-4">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={!pagination.hasPrevPage || loading}
                        className="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="text-sm text-muted-foreground">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!pagination.hasNextPage || loading}
                        className="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Loading Overlay */}
            {loading && products.length > 0 && (
                <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
                </div>
            )}
        </>
    );
}