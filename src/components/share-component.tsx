'use client'

import { useState, useEffect } from 'react'
import { Share2, Copy, Check, Facebook, Twitter, Linkedin, MessageCircle, X } from 'lucide-react'

type ShareVariant = 'buttons' | 'modal'

interface EnhancedShareComponentProps {
    shopId: string | undefined
    shopName: string
    shopImage?: string
    productCount: number
    ownerName?: string
    ownerAddress?: string
    size?: number
    variant?: ShareVariant
}

export default function EnhancedShareComponent({
                                                   shopId,
                                                   shopName,
                                                   shopImage,
                                                   productCount,
                                                   ownerName,
                                                   ownerAddress,
                                                   size = 40,
                                                   variant = 'buttons' // 'buttons' | 'modal'
                                               }: EnhancedShareComponentProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [canUseNativeShare, setCanUseNativeShare] = useState(false)

    const shopUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/shop/${shopId}`
        : `https://duka.aistartupclub.com/shop/${shopId}`

    const shareTitle = `Check out ${shopName} on Duka`
    const shareDescription = `Explore ${productCount} amazing products from ${shopName}${ownerAddress ? ` located in ${ownerAddress}` : ''}. Shop quality items now!`

    useEffect(() => {
        setCanUseNativeShare(typeof navigator !== 'undefined' && !!navigator.share)
    }, [])

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shopUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleNativeShare = async () => {
        try {
            await navigator.share({
                title: shareTitle,
                text: shareDescription,
                url: shopUrl,
            })
        } catch (err: unknown) {
            if (err instanceof Error && err.name !== 'AbortError') {
                console.error('Share failed:', err)
            }
        }
    }
    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shopUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shopUrl)}&text=${encodeURIComponent(shareTitle)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shopUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${shopUrl}`)}`,
    }

    const handleShare = (platform: keyof typeof shareLinks) => {
        const width = 600
        const height = 600
        const left = window.innerWidth / 2 - width / 2
        const top = window.innerHeight / 2 - height / 2

        window.open(
            shareLinks[platform],
            '_blank',
            `width=${width},height=${height},left=${left},top=${top}`
        )
    }

    // Button variant - inline share buttons
    if (variant === 'buttons') {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handleShare('facebook')}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1877F2] hover:bg-[#166fe5] transition-colors"
                    aria-label="Share on Facebook"
                >
                    <Facebook className="w-5 h-5 text-white" />
                </button>

                <button
                    onClick={() => handleShare('twitter')}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1DA1F2] hover:bg-[#1a8cd8] transition-colors"
                    aria-label="Share on Twitter"
                >
                    <Twitter className="w-5 h-5 text-white" />
                </button>

                <button
                    onClick={() => handleShare('whatsapp')}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#22c55e] transition-colors"
                    aria-label="Share on WhatsApp"
                >
                    <MessageCircle className="w-5 h-5 text-white" />
                </button>

                <button
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0A66C2] hover:bg-[#095196] transition-colors"
                    aria-label="Share on LinkedIn"
                >
                    <Linkedin className="w-5 h-5 text-white" />
                </button>

                {canUseNativeShare && (
                    <button
                        onClick={handleNativeShare}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                        aria-label="Share"
                    >
                        <Share2 className="w-5 h-5 text-white" />
                    </button>
                )}
            </div>
        )
    }

    // Modal variant - button that opens modal
    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">Share Shop</span>
            </button>

            {/* Share Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-background border border-border rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-semibold mb-2">Share {shopName}</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Spread the word about this amazing shop
                        </p>

                        {/* Share URL */}
                        <div className="mb-6">
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                Shop Link
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={shopUrl}
                                    readOnly
                                    className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-md"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span className="text-sm">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            <span className="text-sm">Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Share Buttons */}
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-muted-foreground">
                                Share on social media
                            </p>

                            <button
                                onClick={() => handleShare('facebook')}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg transition-colors"
                            >
                                <Facebook className="w-5 h-5" />
                                <span className="font-medium">Share on Facebook</span>
                            </button>

                            <button
                                onClick={() => handleShare('twitter')}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-lg transition-colors"
                            >
                                <Twitter className="w-5 h-5" />
                                <span className="font-medium">Share on Twitter</span>
                            </button>

                            <button
                                onClick={() => handleShare('whatsapp')}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-[#25D366] hover:bg-[#22c55e] text-white rounded-lg transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span className="font-medium">Share on WhatsApp</span>
                            </button>

                            <button
                                onClick={() => handleShare('linkedin')}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-[#0A66C2] hover:bg-[#095196] text-white rounded-lg transition-colors"
                            >
                                <Linkedin className="w-5 h-5" />
                                <span className="font-medium">Share on LinkedIn</span>
                            </button>

                            {canUseNativeShare && (
                                <button
                                    onClick={handleNativeShare}
                                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    <Share2 className="w-5 h-5" />
                                    <span className="font-medium">More share options</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}