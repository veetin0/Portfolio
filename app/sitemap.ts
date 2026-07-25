import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

/**
 * One page, one entry. Sectors and projects are hash fragments (#work,
 * #p/lyvo), not routes — crawlers treat them as the same URL, so listing them
 * would be padding, not coverage.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
