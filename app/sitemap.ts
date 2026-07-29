import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

/**
 * Sectors and projects are hash fragments (#work, #p/lyvo), not routes —
 * crawlers treat them as the same URL, so listing them would be padding, not
 * coverage. Only real routes belong here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      // Submitted to Google Play as the app's privacy policy. Low priority for
      // ranking, but it must stay crawlable — Play re-checks the URL.
      url: `${SITE_URL}/gymplus/privacy`,
      lastModified: new Date('2026-07-28'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
