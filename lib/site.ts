/**
 * Absolute origin for this site.
 *
 * Share cards, robots.txt and sitemap.xml all need a real origin — a relative
 * OG image URL is ignored by every scraper. Vercel injects
 * NEXT_PUBLIC_SITE_URL if you set it; otherwise it falls back to the preview
 * URL it provides automatically, and finally to localhost for dev.
 *
 * Set NEXT_PUBLIC_SITE_URL to your custom domain once you have one.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')
).replace(/\/$/, '')
