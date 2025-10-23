"use client"

import { memo } from "react"
import { Store } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { Shop } from "@/hooks/use-shops"

interface ShopListProps {
    shops: Shop[]
    onCreateClick: () => void
}

export const ShopList = memo(function ShopList({ shops, onCreateClick }: ShopListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            My Shops ({shops.length})
          </span>
                    <Button size="sm" onClick={onCreateClick}>
                        <Store className="mr-2 h-4 w-4" />
                        New Shop
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {shops.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="relative w-32 h-32 mb-4">
                            <Image
                                src="/logo.png"
                                alt="Duka"
                                fill
                                className="object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
                                priority
                            />
                        </div>
                        <p className="text-muted-foreground mb-4 text-sm">No shops yet</p>
                        <Button onClick={onCreateClick} className="shadow-sm hover:shadow-md transition-all">
                            Create Your First Shop
                        </Button>
                    </div>

                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {shops.map((shop) => (
                            <div key={shop._id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                                {shop.image && (
                                    <Image
                                        src={`/api/r2/images/${encodeURIComponent(shop.image.url)}`}
                                        alt={shop.name}
                                        width={400}
                                        height={128}
                                        className="w-full h-32 object-cover rounded-lg mb-3"
                                    />
                                )}
                                <h3 className="font-semibold">{shop.name}</h3>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
})
