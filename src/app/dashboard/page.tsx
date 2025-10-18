// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import ImageUploader from "@/components/ImageUploader";

interface ProductImage {
    url: string;
    filename: string;
    fileExtension: string;
    uploadedAt: Date;
}

interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    images?: ProductImage[];
    category: { _id: string; name: string };
    shop: { _id: string; name: string };
    createdAt: Date;
}

interface Shop {
    _id: string;
    name: string;
    image?: string;
    owners: Array<{ _id: string; name: string; email: string }>;
    products: Product[];
    createdAt: Date;
}

interface Category {
    _id: string;
    name: string;
    slug: string;
}

interface CurrentUser {
    id: string | null;
    name: string | null;
    email: string | null;
    image: string | null;
    roles: string[] | null;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState<'shops' | 'products'>('shops');
    const [shops, setShops] = useState<Shop[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [latestUrl, setLatestUrl] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null >(null);

    // Shop form state
    const [shopForm, setShopForm] = useState({ name: '', image: '' });
    const [showShopForm, setShowShopForm] = useState(false);

    // Product form state
    const [showProductForm, setShowProductForm] = useState(false);
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        shopId: '',
        categoryId: '',
    });


    useEffect(() => {
        setCurrentUser({
            id: session?.user?.id ?? null,
            name: session?.user?.name ?? null,
            email: session?.user?.email ?? null,
            image: session?.user?.image ?? null,
            roles: session?.user?.roles ?? null,
        });
    }, [session]);


    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        } else if (status === 'unauthenticated') {
            setLoading(false);
        }
    }, [status,currentUser]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [shopsRes, categoriesRes] = await Promise.all([
                fetch(`/api/shops?userid=${currentUser?.id}`),
                fetch('/api/categories'),
            ]);

            const [shopsData, categoriesData] = await Promise.all([
                shopsRes.json(),
                categoriesRes.json(),
            ]);

            if (shopsData.success) {
                setShops(shopsData.shops);
                const allProducts = shopsData.shops.flatMap((shop: Shop) =>
                    shop.products.map((product: Product) => ({
                        ...product,
                        shop: { _id: shop._id, name: shop.name }
                    }))
                );
                setProducts(allProducts);
            }
            if (categoriesData.success) setCategories(categoriesData.categories);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateShop = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/shops?ownerId=${currentUser?.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shopForm),
            });

            const data = await response.json();
            if (data.success) {
                setShops([data.shop, ...shops]);
                setShopForm({ name: '', image: '' });
                setShowShopForm(false);
                alert('Shop created successfully!');
            } else {
                alert(data.message || 'Failed to create shop');
            }
        } catch (error) {
            console.error('Error creating shop:', error);
            alert('Failed to create shop');
        }
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!productForm.shopId || !productForm.categoryId) {
            alert('Please select a shop and category');
            return;
        }

        try {
            const response = await fetch(`/api/shops/${productForm.shopId}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: productForm.name,
                    description: productForm.description,
                    price: parseFloat(productForm.price),
                    category: productForm.categoryId,
                }),
            });

            const data = await response.json();
            if (data.success) {
                await fetchData();
                setProductForm({
                    name: '',
                    description: '',
                    price: '',
                    shopId: '',
                    categoryId: '',
                });
                setShowProductForm(false);
                alert('Product created successfully!');
            } else {
                alert(data.message || 'Failed to create product');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product');
        }
    };

    const handleDeleteShop = async (shopId: string) => {
        if (!confirm('Are you sure? This will delete the shop and all its products.')) return;

        try {
            const response = await fetch(`/api/shops?shopId=${shopId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                setShops(shops.filter(shop => shop._id !== shopId));
                setProducts(products.filter(product => product.shop._id !== shopId));
                alert('Shop deleted successfully');
            } else {
                alert(data.message || 'Failed to delete shop');
            }
        } catch (error) {
            console.error('Error deleting shop:', error);
            alert('Failed to delete shop');
        }
    };

    const handleDeleteProduct = async (productId: string, shopId: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`/api/shops/${shopId}/products/${productId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                setProducts(products.filter(product => product._id !== productId));
                setShops(shops.map(shop => {
                    if (shop._id === shopId) {
                        return {
                            ...shop,
                            products: shop.products.filter(p => p._id !== productId)
                        };
                    }
                    return shop;
                }));
                alert('Product deleted successfully');
            } else {
                alert(data.message || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Welcome back, {session?.user?.name}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Shops</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{shops.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{products.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{categories.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('shops')}
                        className={`px-6 py-3 font-medium transition-colors ${
                            activeTab === 'shops'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        My Shops ({shops.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-6 py-3 font-medium transition-colors ${
                            activeTab === 'products'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        All Products ({products.length})
                    </button>
                </div>

                {/* Shops Tab */}
                {activeTab === 'shops' && (
                    <div>
                        <div className="mb-6">
                            <button
                                onClick={() => setShowShopForm(!showShopForm)}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                {showShopForm ? 'Cancel' : '+ Create New Shop'}
                            </button>
                        </div>

                        {/* Shop Form */}
                        {showShopForm && (
                            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-800">
                                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                                    Create New Shop
                                </h2>
                                <form onSubmit={handleCreateShop} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            Shop Image URL (Optional)
                                        </label>

                                        {/* Upload Section */}
                                        <div className="mb-8">
                                            <ImageUploader
                                                onUploadComplete={(url) => {
                                                    setLatestUrl(url);
                                                    console.log('Uploaded image URL:', url);
                                                    setShopForm({ ...shopForm, image: url })
                                                }}
                                            />
                                        </div>

                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            Shop Name
                                        </label>
                                        <input
                                            type="text"
                                            value={shopForm.name}
                                            onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                                    >
                                        Create Shop
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Shops Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {shops.map((shop) => (
                                <div
                                    key={shop._id}
                                    className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800"
                                >
                                    {shop.image && (
                                        <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
                                            <Image
                                                src={shop.image}
                                                alt={shop.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                            {shop.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            Products: {shop.products?.length || 0}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Created: {new Date(shop.createdAt).toLocaleDateString()}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setProductForm({ ...productForm, shopId: shop._id });
                                                    setActiveTab('products');
                                                    setShowProductForm(true);
                                                }}
                                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Add Product
                                            </button>
                                            <button
                                                onClick={() => handleDeleteShop(shop._id)}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {shops.length === 0 && (
                            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                <p className="text-gray-600 dark:text-gray-400">
                                    No shops yet. Create your first shop to get started!
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div>
                        <div className="mb-6">
                            <button
                                onClick={() => setShowProductForm(!showProductForm)}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                disabled={shops.length === 0}
                            >
                                {showProductForm ? 'Cancel' : '+ Create New Product'}
                            </button>
                            {shops.length === 0 && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    Create a shop first before adding products
                                </p>
                            )}
                        </div>

                        {/* Product Form */}
                        {showProductForm && (
                            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-800">
                                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                                    Create New Product
                                </h2>
                                <form onSubmit={handleCreateProduct} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                Product Name
                                            </label>
                                            <input
                                                type="text"
                                                value={productForm.name}
                                                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                Price
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={productForm.price}
                                                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            Description
                                        </label>
                                        <textarea
                                            value={productForm.description}
                                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                Shop
                                            </label>
                                            <select
                                                value={productForm.shopId}
                                                onChange={(e) => setProductForm({ ...productForm, shopId: e.target.value })}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select a shop</option>
                                                {shops.map((shop) => (
                                                    <option key={shop._id} value={shop._id}>
                                                        {shop.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                Category
                                            </label>
                                            <select
                                                value={productForm.categoryId}
                                                onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select a category</option>
                                                {categories.map((category) => (
                                                    <option key={category._id} value={category._id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                                    >
                                        Create Product
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div
                                    key={product._id}
                                    className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800"
                                >
                                    {product.images && product.images.length > 0 ? (
                                        <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
                                            <Image
                                                src={product.images[0].url}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            />
                                            {product.images.length > 1 && (
                                                <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                                    +{product.images.length - 1} more
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-48 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                            <span className="text-gray-400">No Image</span>
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white truncate">
                                            {product.name}
                                        </h3>
                                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                            ${product.price.toFixed(2)}
                                        </p>
                                        {product.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                                {product.description}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                            Shop: {product.shop.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                                            Category: {product.category.name}
                                        </p>
                                        <button
                                            onClick={() => handleDeleteProduct(product._id, product.shop._id)}
                                            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {products.length === 0 && (
                            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                <p className="text-gray-600 dark:text-gray-400">
                                    No products yet. Create your first product!
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}