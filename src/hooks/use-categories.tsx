"use client"

import { useState, useCallback } from "react"

export interface Category {
    _id: string
    name: string
    slug: string
}

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>("")

    const fetchCategories = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const response = await fetch("/api/categories")
            const data = await response.json()
            if (data.success) {
                setCategories(data.categories)
            } else {
                setError(data.error || "Failed to fetch categories")
            }
        } catch (err) {
            setError("Failed to fetch categories")
            console.error("Error fetching categories:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    const filterCategories = useCallback(
        (input: string) => {
            if (!input.trim()) return categories

            const lowerInput = input.toLowerCase()
            return categories.filter(
                (cat) => cat.slug.toLowerCase().includes(lowerInput) || cat.name.toLowerCase().includes(lowerInput),
            )
        },
        [categories],
    )

    return {
        categories,
        loading,
        error,
        setError,
        fetchCategories,
        filterCategories,
    }
}
