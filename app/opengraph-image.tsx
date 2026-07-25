import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { profile } from '@/data/profile'
import { projects } from '@/data/projects'

/**
 * The card people actually see when this link is pasted into LinkedIn, Slack
 * or a DM. Built from the same data and the same typeface as the page, so the
 * preview looks like the thing it opens.
 *
 * The route is static, so Next renders this once at build time — no serverless
 * function, no runtime cost.
 */
export const alt = `${profile.name} — ${profile.role}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Satori reads ttf/otf/woff — not woff2. Geist ships ttf locally, so this
// needs no network access at build time.
const FONT_DIR = join(process.cwd(), 'node_modules/geist/dist/fonts')

async function font(path: string) {
  return readFile(join(FONT_DIR, path))
}

export default async function Image() {
  const [sans, sansMedium, mono] = await Promise.all([
    font('geist-sans/Geist-Regular.ttf'),
    font('geist-sans/Geist-Medium.ttf'),
    font('geist-mono/GeistMono-Regular.ttf'),
  ])

  const liveCount = projects.filter((p) => p.status === 'live').length

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#08090A',
          padding: '68px 76px',
          position: 'relative',
        }}
      >
        {/* The site's dot grid, so the card feels like the same surface. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(#4A5054 1.2px, transparent 1.2px)',
            backgroundSize: '34px 34px',
            opacity: 0.22,
          }}
        />
        {/* Pool of signal light, top-left, matching the pointer glow. */}
        <div
          style={{
            position: 'absolute',
            top: -220,
            left: -160,
            width: 760,
            height: 760,
            background:
              'radial-gradient(circle, rgba(198,242,78,0.11) 0%, rgba(198,242,78,0) 68%)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: 11,
              background: '#0E1011',
              border: '1px solid #1E2224',
              color: '#C6F24E',
              fontFamily: 'GeistMono',
              fontSize: 17,
            }}
          >
            VN
          </div>
          <div
            style={{
              fontFamily: 'GeistMono',
              fontSize: 19,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: '#7A8085',
            }}
          >
            {`${profile.role} · ${profile.location}`}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontFamily: 'GeistMedium',
              fontSize: 96,
              lineHeight: 1,
              letterSpacing: -4,
              color: '#ECEEEA',
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              marginTop: 26,
              maxWidth: 830,
              fontFamily: 'Geist',
              fontSize: 29,
              lineHeight: 1.45,
              color: '#7A8085',
            }}
          >
            {profile.statement}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontFamily: 'GeistMono',
            fontSize: 19,
            color: '#4A5054',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{ width: 7, height: 7, borderRadius: 4, background: '#C6F24E' }}
            />
            <span style={{ color: '#C6F24E' }}>open to work</span>
          </div>
          <span>·</span>
          <span>{`${projects.length} modules`}</span>
          <span>·</span>
          <span>{`${liveCount} live`}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Geist', data: sans, weight: 400, style: 'normal' },
        { name: 'GeistMedium', data: sansMedium, weight: 500, style: 'normal' },
        { name: 'GeistMono', data: mono, weight: 400, style: 'normal' },
      ],
    }
  )
}
