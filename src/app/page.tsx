
import MasonryFeeds from "@/components/masonry-feeds";

export default function Home() {
    return (
        <div className="min-h-screen">
            <main className="container mx-auto px-4 py-12">
                <div className="mb-12 max-w-2xl">
                    <h2 className="font-sans text-4xl font-medium leading-tight tracking-tight text-foreground text-balance">
                        Your Campus Marketplace
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                        Buy and sell textbooks, electronics, fashion, and more within the Karatina University community. Safe, convenient, and built for students.
                    </p>
                </div>


                <MasonryFeeds />
            </main>

            <footer className="mt-24 border-t border-border bg-muted/30">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-sm text-muted-foreground">
                            © 2025 Duka. Made for Karatina University students.
                        </p>
                        <div className="flex gap-6">
                            <a
                                href="#"
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                WhatsApp
                            </a>
                            <a
                                href="#"
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Safety Tips
                            </a>
                            <a
                                href="#"
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Support
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}