import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Store, User, Mail, Phone, MapPin, Users } from "lucide-react";
import { Key } from "react";
import {IUser} from "@/models/User";


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
        next: {revalidate: 60},
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.product;
}

export async function generateMetadata({params}: ProductPageProps): Promise<Metadata> {
    const {id} = await params;
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
        authors: [{name: product.shop.name}],
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

export default async function ProductPage({params}: ProductPageProps) {
    const {id} = await params;
    const product = await getProduct(id);
    const baseUrl = getBaseUrl();
    const shopUrl = `${baseUrl}/shop/${product?.shop._id}?product=${product?._id}`;

    if (!product) {
        return (
            <div className="container mx-auto py-12 text-center">
                <h1 className="text-2xl font-bold">Product not found</h1>
                <p className="mt-4 text-muted-foreground">This product may have been removed or doesn&#39;t exist.</p>
                <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
                    Go back to home
                </Link>
            </div>
        );
    }

    const mainImage = product.images?.[0]?.url
        ? `/api/r2/images/${encodeURIComponent(product.images[0].url)}`
        : "/placeholder.svg";

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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
                            <Image
                                src={mainImage}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {product.images.slice(1, 5).map((img: { _id: Key | null | undefined; url: string | number | boolean; label: string; }) => (
                                    <div key={img._id} className="relative aspect-square overflow-hidden rounded border border-border hover:border-accent transition-colors cursor-pointer">
                                        <Image
                                            src={`/api/r2/images/${encodeURIComponent(img.url)}`}
                                            alt={img.label || product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
                            {product.category && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Category: <span className="font-medium text-foreground">{product.category.name}</span>
                                </p>
                            )}
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-accent">
                                sh{product.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground">KES</span>
                        </div>

                        {product.description && (
                            <div className="prose prose-sm max-w-none">
                                <h3 className="text-lg font-semibold text-foreground">Description</h3>
                                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{product.description}</p>
                            </div>
                        )}

                        {/* Shop Information */}
                        <div className="border-t border-border pt-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Store className="h-5 w-5 text-accent" />
                                Shop Information
                            </h3>

                            <div className="bg-muted rounded-lg p-4 space-y-4 border border-border">
                                <div className="flex items-center gap-3">
                                    {product.shop.image?.url ? (
                                        <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-border">
                                            <Image
                                                src={`/api/r2/images/${encodeURIComponent(product.shop.image.url)}`}
                                                alt={product.shop.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-card flex items-center justify-center border border-border">
                                            <Store className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div>
                                        <Link
                                            href={shopUrl}
                                            className="text-xl font-semibold text-accent hover:underline"
                                        >
                                            {product.shop.name}
                                        </Link>
                                        <p className="text-sm text-muted-foreground">View all products</p>
                                    </div>
                                </div>

                                {product.shop.whatsappGroupUrl && (
                                    <a
                                        href={product.shop.whatsappGroupUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 w-full justify-center bg-success hover:opacity-90 text-success-foreground font-medium py-3 px-4 rounded-lg transition-all active:scale-98"
                                    >
                                        <Users className="h-5 w-5" />
                                        Join WhatsApp Group
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shop Owners/Contact Information */}
                {product.shop.owners && product.shop.owners.length > 0 && (
                    <div className="border-t border-border pt-8">
                        <h2 className="text-2xl font-bold text-foreground mb-6">Contact Seller</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {product.shop.owners.map((owner: IUser) => (
                                <div key={owner._id.toString()} className="bg-card border border-border rounded-lg p-6 space-y-4 card-hover">
                                    <div className="flex items-center gap-3">
                                        {owner.image ? (
                                            <div className="relative h-12 w-12 rounded-full overflow-hidden border border-border">
                                                <Image
                                                    src={owner.image}
                                                    alt={owner.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                                <User className="h-6 w-6 text-accent" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-foreground">{owner.name}</h3>
                                            <p className="text-sm text-muted-foreground">Shop Owner</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {owner.phone && (
                                            <a
                                                href={`https://wa.me/${owner.phone
                                                    .replace(/\D/g, '')       // remove all non-digits
                                                    .replace(/^0/, '254')     // replace leading zero with 254
                                                }`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-success hover:opacity-80 transition-opacity"
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                                WhatsApp: {owner.phone}
                                            </a>
                                        )}

                                        {owner.phone && (
                                            <a
                                                href={`tel:${owner.phone}`}
                                                className="flex items-center gap-2 text-sm text-secondary hover:opacity-80 transition-opacity"
                                            >
                                                <Phone className="h-4 w-4" />
                                                {owner.phone}
                                            </a>
                                        )}

                                        {owner.email && (
                                            <a
                                                href={`mailto:${owner.email}`}
                                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <Mail className="h-4 w-4" />
                                                {owner.email}
                                            </a>
                                        )}

                                        {owner.address && (
                                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <span>{owner.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Product Images Grid */}
                {product.images && product.images.length > 5 && (
                    <div className="border-t border-border pt-8 mt-8">
                        <h2 className="text-2xl font-bold text-foreground mb-6">More Images</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {product.images.slice(5).map((img: { _id: Key | null | undefined; url: string | number | boolean; label: string; }) => (
                                <div key={img._id} className="relative aspect-square overflow-hidden rounded-lg border border-border hover:border-accent transition-colors cursor-pointer group">
                                    <Image
                                        src={`/api/r2/images/${encodeURIComponent(img.url)}`}
                                        alt={img.label || product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}