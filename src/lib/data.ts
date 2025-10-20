// lib/data.ts
export interface Product {
    id: string
    title: string
    price: number
    description: string
    imageUrl: string
    height: number
    shopId: string
    category: string
}

export interface Shop {
    id: string
    name: string
    bio: string
    avatar: string
}

export const shops: Record<string, Shop> = {
    "68f49b301cddd8e716dbce50": {
        id: "68f49b301cddd8e716dbce50",
        name: "Maria Santos",
        bio: "Contemporary abstract artist exploring color and form through digital and traditional mediums.",
        avatar: "/artist-portrait.png",
    },
    "james-chen": {
        id: "james-chen",
        name: "James Chen",
        bio: "Urban photographer capturing the essence of modern cityscapes and architectural beauty.",
        avatar: "/photographer-portrait.png",
    },
    "emma-wilson": {
        id: "emma-wilson",
        name: "Emma Wilson",
        bio: "Botanical illustrator specializing in detailed watercolor studies of flora and fauna.",
        avatar: "/botanical-artist.jpg",
    },
}

export const products: Product[] = [
    {
        id: '68f4d270b56d156848f657b5',
        title: "Abstract Composition",
        price: 450,
        description:
            "A vibrant exploration of color and form, this piece captures the energy of modern abstract expressionism.",
        imageUrl: "/abstract-colorful-art.png",
        height: 400,
        shopId: "68f49b301cddd8e716dbce50",
        category: "Abstract",
    },
    {
        id: '2',
        title: "Urban Landscape",
        price: 320,
        description: "Capturing the dynamic energy of city life through architectural photography.",
        imageUrl: "/urban-cityscape-photography.png",
        height: 300,
        shopId: "james-chen",
        category: "Photography",
    },
    {
        id: '3',
        title: "Botanical Study",
        price: 280,
        description: "Delicate watercolor illustration showcasing the intricate beauty of botanical forms.",
        imageUrl: "/botanical-illustration-flowers.jpg",
        height: 500,
        shopId: "emma-wilson",
        category: "Illustration",
    },
    {
        id: '13',
        title: "Color Fields",
        price: 520,
        description: "Bold geometric shapes intersect with flowing color gradients in this striking composition.",
        imageUrl: "/abstract-colorful-geometric-art.jpg",
        height: 400,
        shopId: "maria-santos",
        category: "Abstract",
    },
    {
        id: '14',
        title: "Fluid Motion",
        price: 380,
        description: "Dynamic swirls of color create a sense of movement and energy in this abstract piece.",
        imageUrl: "/abstract-fluid-art-colorful.png",
        height: 450,
        shopId: "maria-santos",
        category: "Abstract",
    },
    {
        id: '15',
        title: "Night Skyline",
        price: 410,
        description: "The city comes alive at night in this stunning long-exposure photograph.",
        imageUrl: "/city-skyline-night-photography.jpg",
        height: 350,
        shopId: "james-chen",
        category: "Photography",
    },
    {
        id: '16',
        title: "Street Reflections",
        price: 290,
        description: "Rain-soaked streets create beautiful reflections in this urban photography piece.",
        imageUrl: "/rainy-street-reflection-photography.jpg",
        height: 400,
        shopId: "james-chen",
        category: "Photography",
    },
    {
        id: '17',
        title: "Garden Series",
        price: 310,
        description: "A collection of delicate botanical illustrations celebrating garden flowers.",
        imageUrl: "/botanical-garden-flowers-illustration.jpg",
        height: 480,
        shopId: "emma-wilson",
        category: "Illustration",
    },
    {
        id: '18',
        title: "Wild Flora",
        price: 260,
        description: "Detailed study of wildflowers in their natural habitat, rendered in watercolor.",
        imageUrl: "/wildflowers-botanical-watercolor.jpg",
        height: 520,
        shopId: "emma-wilson",
        category: "Illustration",
    },
]

export function getProductsByShop(shopId: string): Product[] {
    return products.filter((product) => product.shopId === shopId)
}

export function getProductById(productId: string): Product | undefined {
    return products.find((product) => product.id === productId)
}
