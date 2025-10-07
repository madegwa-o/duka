import { MasonryGallery } from "@/components/masonry-gallery"

export default function Home() {
    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <h1 className="font-sans text-2xl font-medium tracking-tight text-foreground">Art Galore</h1>
                    <nav className="flex items-center gap-6">
                        <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                            Gallery
                        </a>
                        <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                            Artists
                        </a>
                        <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                            About
                        </a>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="mb-12 max-w-2xl">
                    <h2 className="font-sans text-4xl font-medium leading-tight tracking-tight text-foreground text-balance">
                        Curated Contemporary Art
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                        Discover exceptional works from emerging and established artists around the world.
                    </p>
                </div>

                <MasonryGallery />
            </main>

            <footer className="mt-24 border-t border-border bg-muted/30">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-sm text-muted-foreground">© 2025 Art Galore. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                Instagram
                            </a>
                            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                Newsletter
                            </a>
                            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                Contact
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
