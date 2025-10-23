import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

type ProductPageProps = {
    params: Promise<{ id: string }>;
};

function getBaseUrl() {
    // ✅ Use deployment URL in production, localhost in dev
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.NEXTAUTH_URL) return `https://${process.env.NEXTAUTH_URL}`;
    return "http://localhost:3000";
}

async function getProduct(id: string) {
    const baseUrl = getBaseUrl();

    const res = await fetch(`${baseUrl}/api/public-product/${id}`, {
        next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.product;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { id } = await params;
    const product = await getProduct(id);

    const baseUrl = getBaseUrl();

    if (!product) {
        return {
            title: "Product not found | Duka",
            description: "This product no longer exists on Duka.",
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    const imageUrl = product.images?.[0]?.url
        ? `${baseUrl}/api/r2/images/${encodeURIComponent(product.images[0].url)}`
        : `${baseUrl}/logo.png`;

    const productUrl = `${baseUrl}/product/${product._id}`;
    const shopUrl = `${baseUrl}/shop/${product.shop._id}`;

    // Create a rich description
    const description = product.description
        ? `${product.description.slice(0, 155)}... Available at ${product.shop.name} for sh${product.price.toFixed(2)}.`
        : `Buy ${product.name} for sh${product.price.toFixed(2)} from ${product.shop.name} on Duka. Shop now!`;

    return {
        title: `${product.name} - sh${product.price.toFixed(2)} | ${product.shop.name} | Duka`,
        description,
        keywords: [
            product.name,
            product.shop.name,
            product.category || 'products',
            'buy online',
            'Kenya',
            'Duka',
            'online shopping',
        ],
        authors: [{ name: product.shop.name }],
        creator: product.shop.name,
        publisher: 'Duka',
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        openGraph: {
            type: 'website',
            locale: 'en_KE',
            url: productUrl,
            siteName: 'Duka',
            title: `${product.name} - sh${product.price.toFixed(2)}`,
            description: `Available at ${product.shop.name} for sh${product.price.toFixed(2)}. ${product.description ? product.description.slice(0, 100) : 'Shop now on Duka!'}`,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: product.name,
                    type: 'image/jpeg',
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            site: '@Duka',
            creator: '@Duka',
            title: `${product.name} - sh${product.price.toFixed(2)}`,
            description: `Available at ${product.shop.name}. Shop now on Duka!`,
            images: [
                {
                    url: imageUrl,
                    alt: product.name,
                }
            ],
        },
        alternates: {
            canonical: productUrl,
        },
        other: {
            'product:price:amount': product.price.toString(),
            'product:price:currency': 'KES',
            'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
            'product:brand': product.shop.name,
            'product:condition': 'new',
        },
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const product = await getProduct(id);
    const baseUrl = getBaseUrl();
    const shopUrl = `${baseUrl}/shop/${product?.shop._id}?product=${product?._id}`;

    if (!product) return <div>Product not found.</div>;

    console.log('product: ', product);

    // Add JSON-LD structured data for rich snippets
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images?.[0]?.url
            ? `${baseUrl}/api/r2/images/${encodeURIComponent(product.images[0].url)}`
            : `${baseUrl}/logo.png`,
        description: product.description || `Buy ${product.name} from ${product.shop.name}`,
        brand: {
            '@type': 'Brand',
            name: product.shop.name,
        },
        offers: {
            '@type': 'Offer',
            url: `${baseUrl}/product/${product._id}`,
            priceCurrency: 'KES',
            price: product.price.toFixed(2),
            availability: product.stock > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: product.shop.name,
            },
        },
    };

    return (
        <>
            {/* JSON-LD structured data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="container mx-auto py-12">
                <h1 className="text-3xl font-semibold">{product.name}</h1>
                <p className="mt-2 text-muted-foreground">sh{product.price.toFixed(2)}</p>
                <Image
                    src={`/api/r2/images/${encodeURIComponent(product.images?.[0]?.url || "/placeholder.svg")}`}
                    alt={product.name}
                    className="mt-4 w-96 rounded-md"
                    width={300}
                    height={400}
                />
                <Link href={shopUrl}>See More</Link>
            </div>
        </>
    );
}