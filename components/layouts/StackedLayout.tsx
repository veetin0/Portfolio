'use client'

import { useEffect, useRef, useState } from 'react'
import { projects } from '@/data/projects'
import { sectors, type SectorId } from '@/data/sectors'
import { useUI } from '@/lib/store'
import { cn } from '@/lib/utils'
import { IndexSector } from '@/components/sectors/IndexSector'
import { StackSector } from '@/components/sectors/StackSector'
import { SignalSector } from '@/components/sectors/SignalSector'
import { ProjectCard } from '@/components/work/ProjectCard'
import { SectorMark } from '@/components/ui/primitives'
import { IdentityMark } from '@/components/hud/Hud'

// Module-level so the scroll-spy effect isn't re-armed on every render.
const SECTION_IDS = sectors.map((s) => s.id)

/**
 * Small screens get a real document instead of a simulated canvas: native
 * scrolling, native momentum, no drag-vs-tap ambiguity. Same data, same
 * components, same detail panel — only the spatial metaphor is dropped,
 * because it's the one thing a phone genuinely can't do well.
 */
export function StackedLayout() {
  const active = useScrollSpy(SECTION_IDS)

  return (
    <>
      <IdentityMark />

      <main className="mx-auto w-full max-w-[560px] px-5 pb-28">
        <Section id="index" className="min-h-[100svh] pt-24">
          <IndexSector stacked />
        </Section>

        <Section id="work" className="pt-16">
          <SectorMark ord="01" label="Work" />
          <h2 className="text-[28px] font-medium leading-none tracking-tightest">
            Selected modules
          </h2>
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted text-pretty">
            {projects.length} things I&apos;ve built. Tap one to open it.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>

        <Section id="stack" className="pt-20">
          <StackSector stacked />
        </Section>

        <Section id="signal" className="pt-20">
          <SignalSector stacked />
        </Section>
      </main>

      <MobileRail active={active} />
    </>
  )
}

function Section({
  id,
  className,
  children,
}: {
  id: SectorId
  className?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={cn('scroll-mt-20', className)}>
      {children}
    </section>
  )
}

function MobileRail({ active }: { active: SectorId }) {
  const booted = useUI((s) => s.booted)

  return (
    <nav
      aria-label="Sections"
      className={cn(
        'fixed bottom-4 left-1/2 z-30 -translate-x-1/2 transition-[opacity,transform] duration-700 ease-out',
        booted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
      style={{ transitionDelay: booted ? '500ms' : '0ms' }}
    >
      <div className="pane flex items-center gap-0.5 rounded-full p-1">
        {sectors.map((s) => {
          const isActive = active === s.id
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'relative rounded-full px-3.5 py-1.5 text-[12.5px] tracking-tight transition-colors duration-300',
                isActive ? 'text-signal' : 'text-muted'
              )}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-signal/25 bg-signal/[0.08]"
                />
              )}
              <span className="relative">{s.label}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}

/** Highlights the rail entry for whichever section owns the viewport middle. */
function useScrollSpy(ids: SectorId[]) {
  const [active, setActive] = useState<SectorId>(ids[0])
  const ratios = useRef(new Map<string, number>())

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.current.set(entry.target.id, entry.intersectionRatio)
        }
        let best: SectorId = ids[0]
        let bestRatio = -1
        for (const id of ids) {
          const r = ratios.current.get(id) ?? 0
          if (r > bestRatio) {
            bestRatio = r
            best = id
          }
        }
        setActive(best)
      },
      { threshold: [0, 0.15, 0.35, 0.6, 0.9] }
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [ids])

  return active
}
