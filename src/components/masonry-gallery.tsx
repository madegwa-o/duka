"use client"

import Image from "next/image"
import Link from "next/link"
import { products } from "@/lib/data"

export function MasonryGallery() {
    return (
        <div className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {products.map((product) => (
                <Link
                    key={product.id}
                    href={`/shop/${product.merchantId}?product=${product.id}`}
                    className="group relative block break-inside-avoid overflow-hidden rounded-sm bg-card transition-all hover:shadow-lg"
                >
                    <div className="relative">
                        <Image
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.title}
                            width={300}
                            height={product.height}
                            className="w-full transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/10" />
                    </div>
                    <div className="p-4">
                        <h3 className="font-sans text-sm font-medium text-foreground">{product.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">${product.price}</p>
                    </div>
                </Link>
            ))}
        </div>
    )
}