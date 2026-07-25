'use client'

import { profile } from '@/data/profile'
import { projects } from '@/data/projects'
import { useUI } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Kbd } from '@/components/ui/primitives'
import { ScrambleText, useRotating } from '@/components/ui/ScrambleText'

export function IndexSector({ stacked = false }: { stacked?: boolean }) {
  const booted = useUI((s) => s.booted)
  const goTo = useUI((s) => s.goTo)
  const toggleOverlay = useUI((s) => s.toggleOverlay)
  const tagline = useRotating(profile.taglines, 3400)

  // Staggered entrance. Delay lives in an inline style because Tailwind can't
  // compile arbitrary values from template strings at build time.
  const reveal = cn(
    'transition-[opacity,transform] duration-[900ms] ease-out',
    booted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
  )
  const delay = (ms: number) => ({ transitionDelay: booted ? `${ms}ms` : '0ms' })

  return (
    <div className={stacked ? 'w-full' : 'w-[min(680px,86vw)]'}>
      <div className={reveal} style={delay(80)}>
        <div className="mb-8 flex items-center gap-3">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
          </span>
          <span className="eyebrow text-muted">
            {profile.role} · {profile.location}
          </span>
        </div>
      </div>

      <h1 className={reveal} style={delay(140)}>
        <span className="block text-[clamp(2.6rem,7vw,4.6rem)] font-medium leading-[0.95] tracking-tightest text-text">
          {profile.name.split(' ')[0]}
          <br />
          <span className="text-muted">{profile.name.split(' ').slice(1).join(' ')}</span>
        </span>
      </h1>

      <div className={reveal} style={delay(260)}>
        <div className="mt-5 flex items-center gap-2.5 font-mono text-[13px] text-signal">
          <span className="text-dim">$</span>
          <ScrambleText text={tagline} />
          <span className="h-3.5 w-[7px] animate-blink bg-signal/70" aria-hidden />
        </div>

        <p className="mt-7 max-w-[46ch] text-[15px] leading-relaxed text-muted text-pretty">
          {profile.statement}
        </p>
      </div>

      <div
        className={cn('mt-10 flex flex-wrap items-center gap-2.5', reveal)}
        style={delay(400)}
      >
        <button
          data-interactive
          onClick={() => goTo('work')}
          className="group flex items-center gap-2.5 rounded-full border border-signal/30 bg-signal/[0.07] px-4 py-2 text-[13px] text-signal transition-colors duration-300 hover:bg-signal/[0.13]"
        >
          Explore {projects.length} modules
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
            →
          </span>
        </button>

        <button
          data-interactive
          onClick={() => toggleOverlay('palette')}
          className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[13px] text-muted transition-colors duration-300 hover:border-dim hover:text-text"
        >
          {/* No keyboard to hint at on a phone. */}
          {stacked ? (
            'Search everything'
          ) : (
            <>
              Jump anywhere <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </>
          )}
        </button>
      </div>

      <p
        className={cn('mt-8 font-mono text-2xs leading-relaxed text-dim', reveal)}
        style={delay(520)}
      >
        {stacked ? (
          'scroll to explore · tap a module to open it'
        ) : (
          <>drag the canvas to move · scroll to pan · press <span className="text-muted">~</span> for a terminal</>
        )}
      </p>
    </div>
  )
}
