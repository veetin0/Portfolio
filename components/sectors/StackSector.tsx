'use client'

import { skillGroups } from '@/data/skills'
import { projectsUsing } from '@/lib/graph'
import { sectorById } from '@/data/sectors'
import { flyTo } from '@/lib/camera'
import { useUI } from '@/lib/store'
import { cn } from '@/lib/utils'
import { SectorMark } from '@/components/ui/primitives'

/**
 * The stack, as a control surface rather than a list of logos.
 *
 * Every row is live: hovering lights up the constellation nodes that use it,
 * clicking pins the filter and flies you back to the work sector to see the
 * result. Skills and projects are the same dataset viewed two ways.
 */
export function StackSector({ stacked = false }: { stacked?: boolean }) {
  const focusTag = useUI((s) => s.focusTag)
  const pinned = useUI((s) => s.pinned)
  const hoverTag = useUI((s) => s.hoverTag)
  const pinTag = useUI((s) => s.pinTag)

  const pin = (tag: string) => {
    pinTag(tag)
    // Pinning is a commitment — take them to the thing they just filtered.
    // On the stacked layout the work list is a scroll away, so leave them be.
    if (!stacked && !(pinned && focusTag === tag)) {
      const work = sectorById.get('work')!
      flyTo(work.at.x, work.at.y, work.zoom)
    }
  }

  return (
    <div className={stacked ? 'w-full' : 'w-[720px]'}>
      <SectorMark ord="02" label="Stack" />

      <h2 className="text-[32px] font-medium leading-none tracking-tightest">What I reach for</h2>
      <p className="mt-3 max-w-[52ch] text-[13.5px] leading-relaxed text-muted text-pretty">
        Bars are honest self-assessment, not marketing. The count on the right is how many
        modules actually ship with it — {stacked ? 'tap' : 'hover'} a row to trace it through
        the work.
      </p>

      <div className={cn('mt-8 grid gap-x-10 gap-y-8', stacked ? 'grid-cols-1' : 'grid-cols-2')}>
        {skillGroups.map((group) => (
          <section key={group.id}>
            <header className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
              <h3 className="text-[13px] font-medium tracking-tight text-text">{group.label}</h3>
              <span className="font-mono text-2xs text-dim">{group.note}</span>
            </header>

            <ul className="space-y-1">
              {group.skills.map((skill) => {
                const used = projectsUsing(skill.tag).length
                const active = focusTag === skill.tag
                const dimmed = !!focusTag && !active

                return (
                  <li key={skill.tag}>
                    <button
                      data-interactive
                      onMouseEnter={() => hoverTag(skill.tag)}
                      onMouseLeave={() => hoverTag(null)}
                      onClick={() => pin(skill.tag)}
                      aria-pressed={active}
                      // The meter and count are decorative to a screen reader;
                      // spell the row out instead.
                      aria-label={`${skill.tag} — used in ${used} ${used === 1 ? 'module' : 'modules'}`}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded px-2 py-1.5 text-left transition-all duration-300',
                        active && 'bg-signal/[0.07]',
                        dimmed ? 'opacity-35' : 'opacity-100',
                        'hover:bg-signal/[0.05]'
                      )}
                    >
                      <span
                        className={cn(
                          'w-[122px] shrink-0 truncate font-mono text-[11.5px] transition-colors duration-300',
                          active ? 'text-signal' : 'text-muted group-hover:text-text'
                        )}
                      >
                        {skill.tag}
                      </span>

                      {/* Segmented meter — reads as an instrument, not a
                          progress bar, and stays legible at low values. */}
                      <span className="flex flex-1 gap-[3px]" aria-hidden>
                        {Array.from({ length: 16 }).map((_, i) => {
                          const on = i / 16 < skill.level
                          return (
                            <span
                              key={i}
                              className={cn(
                                'h-[9px] flex-1 rounded-[1px] transition-colors duration-300',
                                on
                                  ? active
                                    ? 'bg-signal/80'
                                    : 'bg-dim group-hover:bg-signal/50'
                                  : 'bg-line/70'
                              )}
                            />
                          )
                        })}
                      </span>

                      <span
                        className={cn(
                          'w-7 shrink-0 text-right font-mono text-2xs transition-colors duration-300',
                          active ? 'text-signal' : 'text-dim'
                        )}
                      >
                        {used > 0 ? `×${used}` : '—'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
