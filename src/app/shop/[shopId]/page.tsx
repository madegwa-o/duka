// app/shop/[shopId]/page.tsx
import { Metadata } from 'next'
import ShopPageClient from './shop-page-client'

interface Product {
    category?: {
        name: string
    }
}

// Server Component - Generate Metadata
export async function generateMetadata({
                                           params,
                                       }: {
    params: Promise<{ shopId: string }>
}): Promise<Metadata> {
    try {
        const { shopId } = await params

        // Fetch shop data on the server
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/feedshop/${shopId}`,
            {
                next: { revalidate: 3600 }, // Cache for 1 hour
            }
        )

        if (!response.ok) {
            throw new Error('Failed to fetch shop data')
        }

        const data = await response.json()
        const shop = data.shop
        const owner = data.owners?.[0]
        const productCount = data.products?.length || 0

        const shopUrl = `${process.env.NEXT_PUBLIC_APP_URL}/shop/${shopId}`
        const title = `${shop.name} - Shop on Duka`
        const description = `Explore ${productCount} quality products from ${shop.name}${
            owner?.address ? ` in ${owner.address}` : ''
        }. ${owner?.name ? `Owned by ${owner.name}.` : ''} Shop now!`

        // Dynamic OG image
        const ogImage = `${process.env.NEXT_PUBLIC_APP_URL}/api/og/shop/${shopId}`

        // Shop image fallback for other uses
        const shopImageUrl = shop.image
            ? `${process.env.NEXT_PUBLIC_APP_URL}/api/r2/images/${shop.image.url}`
            : owner?.image || `${process.env.NEXT_PUBLIC_APP_URL}/og-default.jpg`

        return {
            title,
            description,
            keywords: [
                shop.name,
                'online shop',
                'marketplace',
                'buy products',
                'e-commerce',
                owner?.address,
                owner?.name,
                ...data.products.slice(0, 5).map((p: Product) => p.category?.name),
            ].filter(Boolean),
            authors: owner ? [{ name: owner.name }] : [],
            creator: owner?.name || 'Duka Marketplace',
            publisher: 'Duka',
            openGraph: {
                type: 'website',
                url: shopUrl,
                title,
                description,
                siteName: 'Duka',
                locale: 'en_US',
                images: [
                    {
                        url: ogImage,
                        width: 1200,
                        height: 630,
                        alt: `${shop.name} shop preview`,
                        type: 'image/png',
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                site: '@duka',
                creator: '@duka',
                title,
                description,
                images: [ogImage],
            },
            alternates: {
                canonical: shopUrl,
            },
            robots: {
                index: true,
                follow: true,
                nocache: false,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-video-preview': -1,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                },
            },
            // Additional metadata
            category: 'E-commerce',
            ...(owner?.address && {
                other: {
                    'shop:location': owner.address,
                    'shop:owner': owner.name,
                    'shop:product_count': productCount.toString(),
                },
            }),
        }
    } catch (error) {
        console.error('Metadata generation error:', error)

        // Fallback metadata
        return {
            title: 'Shop - Duka Marketplace',
            description: 'Discover quality products on Duka marketplace',
            openGraph: {
                title: 'Shop - Duka Marketplace',
                description: 'Discover quality products on Duka marketplace',
                siteName: 'Duka',
            },
        }
    }
}

// Server Component - Main Page
export default async function ShopPage({
                                           params
                                       }: {
    params: Promise<{ shopId: string }>
}) {
    const { shopId } = await params
    return <ShopPageClient shopId={shopId} />
}

// Optional: Generate static params for popular shops (SSG)
// export async function generateStaticParams() {
//   // Fetch list of popular shop IDs
//   const shops = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/shops/popular`)
//     .then(res => res.json())
//
//   return shops.map((shop: any) => ({
//     shopId: shop._id,
//   }))
// }