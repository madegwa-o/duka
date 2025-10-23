"use client"

import { useState, useCallback } from "react"

export interface Shop {
    _id: string
    name: string
    image?: { _id: string; label: string; url: string }
}

export function useShops() {
    const [shops, setShops] = useState<Shop[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>("")

    const fetchShops = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const response = await fetch("/api/shops")
            const data = await response.json()
            if (data.success) {
                setShops(data.shops)
            } else {
                setError(data.error || "Failed to fetch shops")
            }
        } catch (err) {
            setError("Failed to fetch shops")
            console.error("Error fetching shops:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    const createShop = useCallback(async (name: string,whatsappGroupUrl: string, imageId?: string) => {
        setError("")
        try {
            const response = await fetch("/api/shops", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    whatsappGroupUrl: whatsappGroupUrl.trim(),
                    image: imageId || undefined,
                }),
            })

            const data = await response.json()

            if (data.success) {
                setShops(data.shops)
                return { success: true }
            } else {
                setError(data.error || "Failed to create shop")
                return { success: false, error: data.error }
            }
        } catch (err) {
            const errorMsg = "Failed to create shop"
            setError(errorMsg)
            console.error("Create shop error:", err)
            return { success: false, error: errorMsg }
        }
    }, [])

    return {
        shops,
        loading,
        error,
        setError,
        fetchShops,
        createShop,
    }
}
