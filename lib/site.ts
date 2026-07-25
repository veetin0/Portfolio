/**
 * Absolute origin for this site.
 *
 * Share cards, robots.txt, sitemap.xml and the canonical link all need a real
 * origin — a relative og:image is ignored by every scraper, and a canonical
 * pointing at the wrong host tells Google to rank that host instead of yours.
 *
 * ── Set NEXT_PUBLIC_SITE_URL in production. ──
 *
 * The fallbacks below are best-effort and one of them has already bitten:
 * VERCEL_PROJECT_PRODUCTION_URL is the alias Vercel *would* use, and it can
 * point at a hostname that returns DEPLOYMENT_NOT_FOUND once a custom domain
 * is attached. That silently produced a dead og:image and a dead canonical in
 * production. VERCEL_URL (the concrete deployment host) is tried first because
 * it always resolves; it changes per deployment, which is why the explicit
 * variable still matters.
 */
const fromEnv =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'http://localhost:3000'

export const SITE_URL = fromEnv.replace(/\/$/, '')

/** True when we are guessing rather than being told. */
export const SITE_URL_IS_GUESS = !process.env.NEXT_PUBLIC_SITE_URL

// Shout during a production build rather than shipping a wrong canonical.
if (SITE_URL_IS_GUESS && process.env.VERCEL) {
  console.warn(
    `\n⚠ NEXT_PUBLIC_SITE_URL is not set. Falling back to ${SITE_URL}.\n` +
      `  If you serve this on a custom domain, set NEXT_PUBLIC_SITE_URL to it —\n` +
      `  otherwise the canonical link, og:image, robots.txt and sitemap.xml all\n` +
      `  point somewhere other than the domain people actually visit.\n`
  )
}
