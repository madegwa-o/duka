// app/api/og/shop/[shopId]/route.ts
// Alternative without JSX syntax (if you prefer .ts extension)
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(
    request: NextRequest,
    { params }: { params: { shopId: string } }
) {
    try {
        const shopId = params.shopId

        // Fetch shop data
        const shopData = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/feedshop/${shopId}`
        ).then(res => res.json())

        const shop = shopData.shop
        const owner = shopData.owners[0]
        const productCount = shopData.products.length

        // Using the ImageResponse with createElement syntax
        const { createElement: h } = await import('react')

        return new ImageResponse(
            h(
                'div',
                {
                    style: {
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                        backgroundImage: 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)',
                    },
                },
                h(
                    'div',
                    {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '40px',
                        },
                    },
                    // Shop Image
                    shop.image &&
                    h('img', {
                        src: `${process.env.NEXT_PUBLIC_APP_URL}/api/r2/images/${shop.image.url}`,
                        alt: shop.name,
                        width: 200,
                        height: 200,
                        style: {
                            borderRadius: '50%',
                            border: '4px solid white',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        },
                    }),
                    // Shop Name
                    h(
                        'div',
                        {
                            style: {
                                fontSize: 72,
                                fontWeight: 'bold',
                                marginTop: 30,
                                textAlign: 'center',
                                color: '#111',
                            },
                        },
                        shop.name
                    ),
                    // Owner Name
                    owner &&
                    h(
                        'div',
                        {
                            style: {
                                fontSize: 32,
                                marginTop: 10,
                                color: '#666',
                            },
                        },
                        `by ${owner.name}`
                    ),
                    // Product Count
                    h(
                        'div',
                        {
                            style: {
                                fontSize: 28,
                                marginTop: 20,
                                color: '#888',
                            },
                        },
                        `${productCount} ${productCount === 1 ? 'Product' : 'Products'}`
                    ),
                    // Location
                    owner?.address &&
                    h(
                        'div',
                        {
                            style: {
                                fontSize: 24,
                                marginTop: 10,
                                color: '#999',
                            },
                        },
                        `📍 ${owner.address}`
                    )
                ),
                // Branding
                h(
                    'div',
                    {
                        style: {
                            position: 'absolute',
                            bottom: 40,
                            fontSize: 32,
                            fontWeight: 'bold',
                            color: '#111',
                        },
                    },
                    'Duka Marketplace'
                )
            ),
            {
                width: 1200,
                height: 630,
            }
        )
    } catch (error) {
        console.error('OG Image generation error:', error)
        return new Response('Failed to generate image', { status: 500 })
    }
}