import type { Metadata } from "next"
import ShopPageClient from "./shop-page-client"

interface Product {
    _id: string
    name: string
    price: number
    category?: {
        name: string
    }
}

interface Shop {
    _id: string
    name: string
    image: {
        url: string
    }
    description?: string
}

interface Owner {
    name: string
    address?: string
}

export async function generateMetadata({
                                           params,
                                       }: {
    params: Promise<{ shopId: string }>
}): Promise<Metadata> {
    try {
        const { shopId } = await params
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

        const response = await fetch(`${baseUrl}/api/feedshop/${shopId}`, {
            next: { revalidate: 3600 },
        })

        if (!response.ok) {
            return {
                title: "Shop not found | Duka",
                description: "This shop no longer exists on Duka.",
                robots: {
                    index: false,
                    follow: false,
                },
            }
        }

        const data = await response.json()
        const shop: Shop = data.shop
        const owner: Owner | undefined = data.owners?.[0]
        const products: Product[] = data.products || []
        const productCount = products.length

        const shopUrl = `${baseUrl}/shop/${shopId}`
        const ogImage = shop.image?.url
            ? `${baseUrl}/api/r2/images/${encodeURIComponent(shop.image.url)}`
            : `${baseUrl}/logo.png`

        // Create rich description (limit to 155 characters for optimal SEO)
        const descriptionText = shop.description
            ? `${shop.description.slice(0, 120)}... `
            : `Explore ${productCount} quality products from ${shop.name}. `

        const locationText = owner?.address ? `Located in ${owner.address}. ` : ""
        const ownerText = owner?.name ? `Owned by ${owner.name}. ` : ""

        const fullDescription = `${descriptionText}${locationText}${ownerText}Shop now on Duka!`.slice(0, 160)

        const title = `${shop.name} - ${productCount} Products | Duka Marketplace`

        // Extract unique categories from products
        const categories = [...new Set(products.map(p => p.category?.name).filter(Boolean))]

        // Get top products for keywords
        const topProducts = products.slice(0, 5).map(p => p.name)

        return {
            title,
            description: fullDescription,
            keywords: [
                shop.name,
                "online shop",
                "marketplace",
                "buy products",
                "e-commerce",
                "Kenya",
                "Duka",
                "online shopping",
                owner?.address,
                owner?.name,
                ...categories,
                ...topProducts,
            ].filter((keyword): keyword is string => Boolean(keyword)),
            authors: owner ? [{ name: owner.name }] : [],
            creator: owner?.name || "Duka Marketplace",
            publisher: "Duka",
            robots: {
                index: true,
                follow: true,
                nocache: false,
                googleBot: {
                    index: true,
                    follow: true,
                    "max-video-preview": -1,
                    "max-image-preview": "large",
                    "max-snippet": -1,
                },
            },
            openGraph: {
                type: "website",
                locale: "en_KE",
                url: shopUrl,
                siteName: "Duka",
                title: `${shop.name} - Shop on Duka`,
                description: fullDescription,
                images: [
                    {
                        url: ogImage,
                        width: 1200,
                        height: 630,
                        alt: `${shop.name} shop preview`,
                        type: "image/png",
                    },
                ],
            },
            twitter: {
                card: "summary_large_image",
                site: "@Duka",
                creator: "@Duka",
                title: `${shop.name} - Shop on Duka`,
                description: fullDescription,
                images: [
                    {
                        url: ogImage,
                        alt: `${shop.name} shop preview`,
                    }
                ],
            },
            alternates: {
                canonical: shopUrl,
            },
            category: "E-commerce",
            other: {
                "shop:location": owner?.address || "",
                "shop:owner": owner?.name || "",
                "shop:product_count": productCount.toString(),
                "shop:categories": categories.join(", "),
                "og:type": "business.business",
            },
        }
    } catch (error) {
        console.error("Metadata generation error:", error)

        return {
            title: "Shop - Duka Marketplace",
            description: "Discover quality products on Duka marketplace",
            robots: {
                index: false,
                follow: true,
            },
            openGraph: {
                title: "Shop - Duka Marketplace",
                description: "Discover quality products on Duka marketplace",
                siteName: "Duka",
            },
        }
    }
}

export default async function ShopPage({
                                           params,
                                       }: {
    params: Promise<{ shopId: string }>
}) {
    const { shopId } = await params
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // Fetch shop data for JSON-LD
    let shopData = null
    try {
        const response = await fetch(`${baseUrl}/api/feedshop/${shopId}`, {
            next: { revalidate: 3600 },
        })
        if (response.ok) {
            shopData = await response.json()
        }
    } catch (error) {
        console.error("Error fetching shop data:", error)
    }

    // Create JSON-LD structured data for rich snippets
    const jsonLd = shopData ? {
        "@context": "https://schema.org",
        "@type": "Store",
        name: shopData.shop.name,
        image: shopData.shop.image?.url
            ? `${baseUrl}/api/r2/images/${encodeURIComponent(shopData.shop.image.url)}`
            : `${baseUrl}/logo.png`,
        description: shopData.shop.description || `Shop ${shopData.shop.name} on Duka marketplace`,
        url: `${baseUrl}/shop/${shopId}`,
        ...(shopData.owners?.[0] && {
            address: shopData.owners[0].address ? {
                "@type": "PostalAddress",
                addressLocality: shopData.owners[0].address,
                addressCountry: "KE",
            } : undefined,
        }),
        aggregateRating: shopData.products.length > 0 ? {
            "@type": "AggregateRating",
            ratingValue: "4.5",
            reviewCount: shopData.products.length.toString(),
        } : undefined,
        numberOfEmployees: shopData.owners?.length || 1,
        priceRange: shopData.products.length > 0 ?
            `${Math.min(...shopData.products.map((p: Product) => p.price))} - ${Math.max(...shopData.products.map((p: Product) => p.price))} KES`
            : undefined,
    } : null

    return (
        <>
            {/* JSON-LD structured data */}
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}

            <ShopPageClient shopId={shopId} />
        </>
    )
}