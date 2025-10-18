'use client'

import ShareComponent from '@/components/share-component'
import { Bookmark } from 'lucide-react'


export default function SharePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-muted">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-foreground mb-4">
                        Share This Amazing App
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Help spread the word about this incredible content
                    </p>
                </div>

                {/* Additional Share CTA */}
                <div className="bg-card rounded-2xl shadow-lg p-8 text-center border border-border">
                    {/* Share Section */}
                    <div className="bg-gradient-to-r from-secondary to-muted rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-left">
                                <h3 className="text-2xl font-bold text-card-foreground mb-2">
                                    Love this app?
                                </h3>
                                <p className="text-muted-foreground">
                                    Share it with your friends
                                </p>
                            </div>
                            <button className="p-3 hover:bg-primary hover:text-primary-foreground rounded-full transition-colors">
                                <Bookmark className="text-muted-foreground" size={24} />
                            </button>
                        </div>

                        <ShareComponent
                            url="https://kia.aistartupclub.com"
                            title="Join the Smart Care Revolution 🚀"
                            description="Kia is redefining how we access healthcare — instant, secure, and powered by AI. Share and invite others to experience the future of medicine."
                            hashtag="#KiaAI #DigitalHealth"
                            platforms={['facebook', 'twitter', 'linkedin', 'whatsapp', 'native']}
                            size={50}
                        />

                    </div>
                </div>

                {/* Footer Note */}
                <div className="text-center mt-8 text-muted-foreground text-sm">
                    <p>Click any icon above to share this article on your favorite platform</p>
                </div>
            </div>
        </div>
    )
}