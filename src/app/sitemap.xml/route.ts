import { NextResponse } from "next/server";

export async function GET() {
    const baseUrl = "https://kia.aistartupclub.com";

    const pages = [
        "",
        "/consult",
        "/scan",
        "/pricing",
        "/history",
        "/account",
        "/signin",
        "/docs",
        "/notifications",
        "/share",
    ];

    const urls = pages
        .map(
            (page) => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === "" ? "1.0" : "0.7"}</priority>
  </url>`
        )
        .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${urls}
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
