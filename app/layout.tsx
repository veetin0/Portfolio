import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { profile } from '@/data/profile'
import { SITE_URL } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  // Without metadataBase the generated OG image resolves to a relative path,
  // and every scraper ignores a relative og:image. This is the line that makes
  // the share card actually appear.
  metadataBase: new URL(SITE_URL),
  title: `${profile.name} — ${profile.role}`,
  description: profile.statement,
  openGraph: {
    title: profile.name,
    description: profile.statement,
    type: 'website',
    url: SITE_URL,
    siteName: profile.name,
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: profile.name,
    description: profile.statement,
  },
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#08090A',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  // The canvas handles its own zoom; browser pinch-zoom fights it.
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // The pre-paint script below stamps data-js before React hydrates, which
      // React would otherwise report as a server/client attribute mismatch.
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      style={
        {
          '--font-sans': GeistSans.style.fontFamily,
          '--font-mono': GeistMono.style.fontFamily,
        } as React.CSSProperties
      }
    >
      <head>
        {/*
          Runs before first paint. Marks that JS is available so the static
          fallback can hide itself immediately — otherwise repeat visitors see
          one frame of the plain-HTML version before the canvas mounts.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.dataset.js="1"`,
          }}
        />
      </head>
      <body className="bg-bg text-text antialiased">
        {children}
        {/*
          Vercel Analytics. Cookieless and aggregate-only, so it needs no
          consent banner under GDPR — which is the whole reason it's acceptable
          on a site that makes a point of not tracking anyone.

          It only reports from a Vercel deployment; locally it's a no-op, so
          your own dev traffic never shows up in the numbers.
        */}
        <Analytics />
      </body>
    </html>
  )
}
