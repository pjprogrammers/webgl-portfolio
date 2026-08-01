import { siteUrl } from "@/config/site.config";

const body = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${siteUrl("/sitemap.xml")}

# Allow all major search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

# Disallow sensitive areas (if any)
Disallow: /api/
Disallow: /admin/
Disallow: /private/

# Crawl delay (optional)
Crawl-delay: 1
`;

export function GET() {
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
