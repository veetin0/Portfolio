'use client'

import { sectors } from '@/data/sectors'
import { useUI } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Kbd } from '@/components/ui/primitives'

/**
 * Primary navigation. Always visible, never scrolls away — the rail is the
 * one fixed point in a canvas you can otherwise drag anywhere.
 */
export function SectorRail() {
  const nearest = useUI((s) => s.nearest)
  const booted = useUI((s) => s.booted)
  const goTo = useUI((s) => s.goTo)
  const toggleOverlay = useUI((s) => s.toggleOverlay)

  return (
    <nav
      aria-label="Sectors"
      className={cn(
        'pointer-events-auto fixed bottom-4 left-1/2 z-30 -translate-x-1/2',
        'transition-[opacity,transform] duration-700 ease-out',
        booted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
      style={{ transitionDelay: booted ? '620ms' : '0ms' }}
    >
      <div className="pane flex items-center gap-0.5 rounded-full p-1">
        {sectors.map((sector) => {
          const active = nearest === sector.id
          return (
            <button
              key={sector.id}
              data-interactive
              onClick={() => goTo(sector.id)}
              aria-current={active ? 'true' : undefined}
              title={sector.hint}
              className={cn(
                'relative flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors duration-300',
                active ? 'text-signal' : 'text-muted hover:text-text'
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-signal/25 bg-signal/[0.08]"
                />
              )}
              <span className="relative font-mono text-[10px] opacity-60">{sector.ord}</span>
              <span className="relative hidden text-[12.5px] tracking-tight sm:inline">
                {sector.label}
              </span>
            </button>
          )
        })}

        <span aria-hidden className="mx-1 h-4 w-px bg-line" />

        <button
          data-interactive
          onClick={() => toggleOverlay('palette')}
          aria-label="Open command palette"
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-muted transition-colors duration-300 hover:text-text"
        >
          <SearchIcon />
          <span className="hidden items-center gap-0.5 sm:flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>

        <button
          data-interactive
          onClick={() => toggleOverlay('terminal')}
          aria-label="Open terminal"
          title="Terminal — press ~"
          className="hidden rounded-full px-2.5 py-1.5 font-mono text-[12px] text-muted transition-colors duration-300 hover:text-signal sm:block"
        >
          {'>_'}
        </button>
      </div>
    </nav>
  )
}

function SearchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="5.2" cy="5.2" r="3.6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 8l2.4 2.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
