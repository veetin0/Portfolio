'use client'

import { useEffect, useState } from 'react'
import { profile } from '@/data/profile'
import { cn } from '@/lib/utils'
import { SectorMark } from '@/components/ui/primitives'
import { LocalClock } from '@/components/ui/LocalClock'
import { Portrait } from '@/components/ui/Portrait'

export function SignalSector({ stacked = false }: { stacked?: boolean }) {
  return (
    // Emit one width or the other, never both: Tailwind resolves conflicting
    // utilities by CSS source order, not by the order you list them, so
    // `cn('w-[760px]', stacked && 'w-full')` is a coin flip.
    //
    // The pb reserves the ~56px the rail floats over. Because the sector is
    // centred on its world point, that padding lifts the real content by half
    // of it, so the last line clears the rail. Only this sector is tall enough
    // to need it.
    <div className={stacked ? 'w-full' : 'w-[760px] pb-14'}>
      <SectorMark ord="03" label="Signal" />

      {/* Identity header: the face, then the log. Reads as a personnel record,
          which is the one place on a system-shaped site a photo belongs. */}
      <div className={cn('flex items-end gap-6', stacked && 'gap-5')}>
        {profile.portrait && (
          <Portrait
            src={profile.portrait.src}
            alt={profile.portrait.alt}
            className={cn('w-[150px]', stacked && 'w-[108px]')}
          />
        )}

        <div className="min-w-0 flex-1 pb-1">
          <h2
            className={cn(
              'font-medium leading-none tracking-tightest',
              stacked ? 'text-[25px]' : 'text-[32px]'
            )}
          >
            How I got here
          </h2>
          <p
            className={cn(
              'mt-3 max-w-[38ch] leading-relaxed text-muted text-pretty',
              stacked ? 'text-[12.5px]' : 'text-[13.5px]'
            )}
          >
            {profile.role} in {profile.location}, currently{' '}
            <span className="text-signal">open to work</span>.
          </p>
        </div>
      </div>

      {/* Boot log. Each entry is a line in the system's history. */}
      <ol className="mt-8 space-y-0">
        {profile.log.map((entry, i) => (
          <li key={i} className="group relative flex gap-5 pb-4 last:pb-0">
            {/* Runs through the dots: 56px date column + 20px gap + half a
                6px dot. */}
            <span
              aria-hidden
              className="absolute left-[78px] top-2 h-full w-px bg-line group-last:hidden"
            />
            <span
              className={cn(
                'w-14 shrink-0 pt-px text-right font-mono text-2xs transition-colors duration-300',
                entry.highlight ? 'text-signal' : 'text-dim'
              )}
            >
              {entry.at}
            </span>
            <span
              aria-hidden
              className={cn(
                'relative z-10 mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full ring-4 ring-bg transition-colors duration-300',
                entry.at === 'now' || entry.highlight
                  ? 'bg-signal'
                  : 'bg-dim group-hover:bg-muted'
              )}
            >
              {/* A judged result earns a halo the other entries don't get. */}
              {entry.highlight && (
                <span className="absolute -inset-1 rounded-full bg-signal/20 blur-[2px]" />
              )}
            </span>
            <span
              className={cn(
                '-mt-0.5 text-[13.5px] leading-relaxed transition-colors duration-300 text-pretty',
                entry.highlight ? 'text-text' : 'text-muted group-hover:text-text'
              )}
            >
              {entry.text}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
        <Cell label="Local time">
          <LocalClock timeZone={profile.timezone} />
        </Cell>
        <Cell label="Status">
          <span className="text-signal">open to work</span>
        </Cell>
        <Cell label="Based in" className="col-span-2 sm:col-span-1">
          {profile.location}
        </Cell>
      </div>

      <div className="mt-5 flex flex-col gap-px overflow-hidden rounded-xl border border-line bg-line">
        <Contact label="Email" value={profile.links.email} href={`mailto:${profile.links.email}`} />
        {/* Displayed value is derived from the href, so the two can never
            drift apart the way a hardcoded handle would. */}
        <Contact label="GitHub" value={displayUrl(profile.links.github)} href={profile.links.github} external />
        <Contact label="LinkedIn" value={displayUrl(profile.links.linkedin)} href={profile.links.linkedin} external />
      </div>

      {profile.cv && <CvRow cv={profile.cv} />}

      <p className="mt-6 font-mono text-2xs text-dim">
        Built with Next.js, TypeScript, and Tailwind. No template.
      </p>
    </div>
  )
}

/**
 * The CV download. Styled as an action rather than another contact row,
 * because it is the one thing on this page a recruiter is actually looking for.
 *
 * Renders nothing if the file 404s — you can ship the site before the PDF.
 */
function CvRow({ cv }: { cv: NonNullable<typeof profile.cv> }) {
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let alive = true
    // HEAD is enough to know whether the file is there, and costs no download.
    fetch(cv.href, { method: 'HEAD' })
      .then((r) => alive && !r.ok && setMissing(true))
      .catch(() => alive && setMissing(true))
    return () => {
      alive = false
    }
  }, [cv.href])

  if (missing) return null

  return (
    <a
      data-interactive
      href={cv.href}
      download
      className="group mt-4 flex items-center justify-between gap-3 rounded-xl border border-signal/25 bg-signal/[0.06] px-4 py-3.5 transition-colors duration-300 hover:border-signal/45 hover:bg-signal/[0.11]"
    >
      <span className="flex flex-col">
        <span className="text-[13px] text-signal">{cv.label}</span>
        {cv.updated && (
          <span className="mt-0.5 font-mono text-2xs text-dim">Updated {cv.updated} · PDF</span>
        )}
      </span>
      <svg
        width="13"
        height="13"
        viewBox="0 0 13 13"
        fill="none"
        aria-hidden
        className="shrink-0 text-signal transition-transform duration-300 group-hover:translate-y-0.5"
      >
        <path
          d="M6.5 1v8m0 0L3.5 6m3 3l3-3M1.5 11.5h10"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  )
}

/** "https://www.linkedin.com/in/foo" → "linkedin.com/in/foo" */
function displayUrl(href: string) {
  return href.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
}

function Cell({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('bg-raised px-4 py-3', className)}>
      <div className="eyebrow mb-1">{label}</div>
      <div className="font-mono text-[13px] text-text">{children}</div>
    </div>
  )
}

function Contact({
  label,
  value,
  href,
  external,
}: {
  label: string
  value: string
  href: string
  external?: boolean
}) {
  return (
    <a
      data-interactive
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      className="group flex items-center justify-between gap-4 bg-raised px-4 py-3 transition-colors duration-300 hover:bg-raised/50"
    >
      <span className="eyebrow group-hover:text-signal/70">{label}</span>
      <span className="flex items-center gap-2.5 font-mono text-[13px] text-muted transition-colors duration-300 group-hover:text-signal">
        <span className="truncate">{value}</span>
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
          ↗
        </span>
      </span>
    </a>
  )
}
