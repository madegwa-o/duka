'use client'

import { ReactNode, useState, useEffect } from 'react'
import {
    FacebookShareButton,
    TwitterShareButton,
    LinkedinShareButton,
    WhatsappShareButton,
    FacebookIcon,
    TwitterIcon,
    LinkedinIcon,
    WhatsappIcon,
} from 'react-share'
import { Share2 } from 'lucide-react'

type Platform = 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'native'

interface ShareConfig {
    url: string
    title: string
    description?: string
    hashtag?: string
    platforms?: Platform[]
    size?: number
    round?: boolean
}

export default function ShareComponent({
                                           url,
                                           title,
                                           description,
                                           hashtag,
                                           platforms = ['facebook', 'twitter', 'linkedin', 'whatsapp'],
                                           size = 40,
                                           round = true,
                                       }: ShareConfig) {
    const [canUseNativeShare, setCanUseNativeShare] = useState(false)

    useEffect(() => {
        setCanUseNativeShare(!!navigator.share)
    }, [])

    const handleNativeShare = async () => {
        try {
            await navigator.share({
                title: title,
                text: description,
                url: url,
            })
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                console.error('Share failed:', err)
            }
        }
    }

    const shareButtons: Record<Platform, ReactNode> = {
        facebook: (
            <FacebookShareButton url={url} hashtag={hashtag}>
                <FacebookIcon size={size} round={round} />
            </FacebookShareButton>
        ),
        twitter: (
            <TwitterShareButton url={url} title={title}>
                <TwitterIcon size={size} round={round} />
            </TwitterShareButton>
        ),
        linkedin: (
            <LinkedinShareButton url={url}>
                <LinkedinIcon size={size} round={round} />
            </LinkedinShareButton>
        ),
        whatsapp: (
            <WhatsappShareButton url={url} title={title}>
                <WhatsappIcon size={size} round={round} />
            </WhatsappShareButton>
        ),
        native: canUseNativeShare ? (
            <button
                onClick={handleNativeShare}
                className="inline-flex items-center justify-center"
                title="Share via..."
            >
                <div
                    className="flex items-center justify-center rounded-full bg-gray-700"
                    style={{ width: size, height: size }}
                >
                    <Share2 className="text-white" size={size * 0.5} />
                </div>
            </button>
        ) : null,
    }

    return (
        <div className="flex gap-3">
            {platforms.map((platform) => {
                const button = shareButtons[platform]
                return button ? <div key={platform}>{button}</div> : null
            })}
        </div>
    )
}