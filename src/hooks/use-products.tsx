"use client"

import { useState, useCallback } from "react"

export interface Product {
    _id: string
    name: string
    description?: string
    price: number
    shop: { _id: string; name: string }
    images: Array<{ _id: string; label: string; url: string }>
    category: { _id: string; name: string }
}

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>("")

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const response = await fetch("/api/products")
            const data = await response.json()
            if (data.success) {
                setProducts(data.products)
            } else {
                setError(data.error || "Failed to fetch products")
            }
        } catch (err) {
            setError("Failed to fetch products")
            console.error("Error fetching products:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    const createProduct = useCallback(
        async (productData: {
            name: string
            description: string
            price: number
            shop: string
            categorySlug: string
            images: string[]
        }) => {
            setError("")
            try {
                const response = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(productData),
                })

                const data = await response.json()

                if (data.success) {
                    setProducts(data.products)
                    return { success: true, categoryCreated: data.categoryCreated }
                } else {
                    setError(data.error || "Failed to create product")
                    return { success: false, error: data.error }
                }
            } catch (err) {
                const errorMsg = "Failed to create product"
                setError(errorMsg)
                console.error("Create product error:", err)
                return { success: false, error: errorMsg }
            }
        },
        [],
    )

    return {
        products,
        loading,
        error,
        setError,
        fetchProducts,
        createProduct,
    }
}
