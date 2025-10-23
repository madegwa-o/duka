"use client"

import { useState, useEffect } from "react"
import { SearchFiltersComponent, type SearchFilters } from "@/components/search-filters"
import MasonryFeeds from "@/components/masonry-feeds"
import { useCategories } from "@/hooks/use-categories"

export default function Home() {
    const { categories, fetchCategories } = useCategories()
    const [filters, setFilters] = useState<SearchFilters>({
        search: "",
        categories: [],
        priceMin: null,
        priceMax: null,
        sortBy: "createdAt",
        sortOrder: "desc",
    })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    const handleFiltersChange = (newFilters: SearchFilters) => {
        setFilters(newFilters)
    }

    return (
        <div className="min-h-screen">
            <main className="container mx-auto px-4 py-12">

                <a
                    href="https://chat.whatsapp.com/F2QqO06EOyVDi7W36sQrTn?mode=wwt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mb-12 max-w-2xl transition-transform hover:scale-[1.02] hover:shadow-sm rounded-xl p-2"
                >
                    <div>
                        <h2 className="font-sans text-4xl font-medium leading-tight tracking-tight text-foreground text-balance">
                            Your Campus Marketplace
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                            Buy and sell foodstuffs, electronics, fashion, and more within the Karatina University community. Safe,
                            convenient, and built for students.
                        </p>
                    </div>
                </a>


                <SearchFiltersComponent categories={categories} onFiltersChange={handleFiltersChange} isLoading={isLoading} />

                <MasonryFeeds filters={filters} onLoadingChange={setIsLoading} />
            </main>

            <footer className="mt-24 border-t border-border bg-muted/30">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-sm text-muted-foreground">© 2025 Duka. Made for Karatina University students.</p>
                        <div className="flex gap-6">
                            <a href="https://chat.whatsapp.com/F2QqO06EOyVDi7W36sQrTn?mode=wwt" target='_blank' className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                WhatsApp
                            </a>
                            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                Safety Tips
                            </a>
                            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                Support
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
