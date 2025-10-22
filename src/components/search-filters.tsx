"use client"

import { useState, useCallback, useEffect } from "react"
import { Search, X, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category } from "@/hooks/use-categories"

export interface SearchFilters {
    search: string
    categories: string[]
    priceMin: number | null
    priceMax: number | null
    sortBy: "createdAt" | "price" | "name"
    sortOrder: "asc" | "desc"
}

interface SearchFiltersProps {
    categories: Category[]
    onFiltersChange: (filters: SearchFilters) => void
    isLoading?: boolean
}

export function SearchFiltersComponent({ categories, onFiltersChange, isLoading = false }: SearchFiltersProps) {
    const [search, setSearch] = useState("")
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [priceMin, setPriceMin] = useState<string>("")
    const [priceMax, setPriceMax] = useState<string>("")
    const [sortBy, setSortBy] = useState<"createdAt" | "price" | "name">("createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            onFiltersChange({
                search: search.trim(),
                categories: selectedCategories,
                priceMin: priceMin ? Number.parseFloat(priceMin) : null,
                priceMax: priceMax ? Number.parseFloat(priceMax) : null,
                sortBy,
                sortOrder,
            })
        }, 300)

        return () => clearTimeout(timer)
    }, [search, selectedCategories, priceMin, priceMax, sortBy, sortOrder, onFiltersChange])

    const handleCategoryToggle = useCallback((categoryId: string) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
        )
    }, [])

    const handleClearFilters = useCallback(() => {
        setSearch("")
        setSelectedCategories([])
        setPriceMin("")
        setPriceMax("")
        setSortBy("createdAt")
        setSortOrder("desc")
    }, [])

    const hasActiveFilters =
        search || selectedCategories.length > 0 || priceMin || priceMax || sortBy !== "createdAt" || sortOrder !== "desc"

    return (
        <div className="space-y-4 mb-8">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                    placeholder="Search products, shops..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 h-11 text-base"
                />
            </div>

            {/* Filter Toggle & Sort */}
            <div className="flex gap-2 items-center">
                <Button
                    variant={showFilters ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    disabled={isLoading}
                    className="gap-2"
                >
                    <Sliders className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                        <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
              {[search ? 1 : 0, selectedCategories.length, priceMin ? 1 : 0, priceMax ? 1 : 0].reduce(
                  (a, b) => a + b,
                  0,
              )}
            </span>
                    )}
                </Button>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as "createdAt" | "price" | "name")} disabled={isLoading}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="createdAt">Newest</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")} disabled={isLoading}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="desc">High to Low</SelectItem>
                        <SelectItem value="asc">Low to High</SelectItem>
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        disabled={isLoading}
                        className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Expandable Filters */}
            {showFilters && (
                <div className="border border-border rounded-lg p-4 space-y-4 bg-card/50">
                    {/* Price Range */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Price Range</Label>
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <Label htmlFor="priceMin" className="text-xs text-muted-foreground">
                                    Min
                                </Label>
                                <Input
                                    id="priceMin"
                                    type="number"
                                    placeholder="0"
                                    value={priceMin}
                                    onChange={(e) => setPriceMin(e.target.value)}
                                    disabled={isLoading}
                                    className="h-9"
                                />
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="priceMax" className="text-xs text-muted-foreground">
                                    Max
                                </Label>
                                <Input
                                    id="priceMax"
                                    type="number"
                                    placeholder="10000"
                                    value={priceMax}
                                    onChange={(e) => setPriceMax(e.target.value)}
                                    disabled={isLoading}
                                    className="h-9"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    {categories.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Categories</Label>
                            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                                {categories.map((category) => (
                                    <div key={category._id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={category._id}
                                            checked={selectedCategories.includes(category._id)}
                                            onCheckedChange={() => handleCategoryToggle(category._id)}
                                            disabled={isLoading}
                                        />
                                        <Label htmlFor={category._id} className="text-sm font-normal cursor-pointer flex-1">
                                            {category.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
