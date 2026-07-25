'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { projects } from '@/data/projects'
import { profile } from '@/data/profile'
import { sectors, type SectorId } from '@/data/sectors'
import { allSkills } from '@/data/skills'
import { nodeById } from '@/lib/graph'
import { flyTo } from '@/lib/camera'
import { rank } from '@/lib/fuzzy'
import { useUI } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Kbd } from '@/components/ui/primitives'

interface Command {
  id: string
  label: string
  hint?: string
  group: 'Sectors' | 'Modules' | 'Stack' | 'Actions'
  keywords: string[]
  run: () => void
}

export function CommandPalette() {
  const overlay = useUI((s) => s.overlay)
  const open = overlay === 'palette'

  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const goTo = useUI((s) => s.goTo)
  const openAt = useUI((s) => s.openAt)
  const close = useUI((s) => s.close)
  const pinTag = useUI((s) => s.pinTag)
  const clearTag = useUI((s) => s.clearTag)
  const setOverlay = useUI((s) => s.setOverlay)

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = []

    for (const s of sectors) {
      list.push({
        id: `sector:${s.id}`,
        label: s.label,
        hint: s.hint,
        group: 'Sectors',
        keywords: [s.label, s.hint, s.ord],
        run: () => goTo(s.id as SectorId),
      })
    }

    for (const p of projects) {
      list.push({
        id: `project:${p.id}`,
        label: p.name,
        hint: p.tagline,
        group: 'Modules',
        keywords: [p.name, p.tagline, p.id, p.domain, ...p.stack],
        run: () => {
          const node = nodeById.get(p.id)
          if (node) flyTo(node.x, node.y, 1.05)
          openAt(p.id)
        },
      })
    }

    for (const tag of [...new Set(allSkills)]) {
      list.push({
        id: `tag:${tag}`,
        label: tag,
        hint: 'Filter the constellation',
        group: 'Stack',
        keywords: [tag],
        run: () => {
          pinTag(tag)
          goTo('work')
        },
      })
    }

    list.push(
      {
        id: 'action:terminal',
        label: 'Open terminal',
        hint: 'or press ~',
        group: 'Actions',
        keywords: ['terminal', 'console', 'shell', 'command'],
        run: () => setOverlay('terminal'),
      },
      {
        id: 'action:email',
        label: 'Copy email address',
        hint: profile.links.email,
        group: 'Actions',
        keywords: ['email', 'contact', 'mail', 'hire'],
        run: () => {
          void navigator.clipboard?.writeText(profile.links.email)
          close()
        },
      },
      {
        id: 'action:github',
        label: 'Open GitHub',
        hint: profile.links.github,
        group: 'Actions',
        keywords: ['github', 'source', 'code', 'repo'],
        run: () => {
          window.open(profile.links.github, '_blank', 'noopener')
          close()
        },
      },
      {
        id: 'action:clear',
        label: 'Clear stack filter',
        group: 'Actions',
        keywords: ['clear', 'reset', 'filter'],
        run: () => {
          clearTag()
          close()
        },
      }
    )

    return list
  }, [goTo, openAt, close, pinTag, clearTag, setOverlay])

  const results = useMemo(
    () => rank(query, commands, (c) => [c.label, ...c.keywords]).slice(0, 40),
    [query, commands]
  )

  // Reset on every open so the palette never remembers a stale query.
  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      // Wait a frame so the input exists and the entrance isn't interrupted.
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => setCursor(0), [query])

  // Keep the highlighted row in view when navigating by keyboard.
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || (e.key === 'n' && e.ctrlKey)) {
      e.preventDefault()
      setCursor((c) => (c + 1) % Math.max(1, results.length))
    } else if (e.key === 'ArrowUp' || (e.key === 'p' && e.ctrlKey)) {
      e.preventDefault()
      setCursor((c) => (c - 1 + results.length) % Math.max(1, results.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      results[cursor]?.run()
    }
  }

  let lastGroup = ''

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="Close command palette"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-bg/60 backdrop-blur-[3px]"
          />

          {/* Static wrapper handles centring — Framer's inline transform for
              y/scale would otherwise clobber a -translate-x-1/2 class. */}
          <div className="pointer-events-none fixed inset-x-0 top-[14vh] z-[61] flex justify-center px-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              initial={{ opacity: 0, y: -8, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.99 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="pane pointer-events-auto w-[min(560px,100%)] overflow-hidden rounded-xl"
            >
              <div className="flex items-center gap-3 border-b border-line px-4">
                <span className="font-mono text-sm text-signal">⌘</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Search modules, sectors, stack…"
                  aria-label="Search"
                  className="w-full bg-transparent py-3.5 text-[14px] text-text outline-none placeholder:text-dim"
                />
                <Kbd>esc</Kbd>
              </div>

              <div
                ref={listRef}
                data-scrollable
                className="max-h-[46vh] overflow-y-auto overscroll-contain p-1.5"
              >
                {results.length === 0 && (
                  <p className="px-3 py-8 text-center text-[13px] text-dim">
                    Nothing matches “{query}”.
                  </p>
                )}

                {results.map((cmd, i) => {
                  const showGroup = cmd.group !== lastGroup
                  lastGroup = cmd.group
                  const active = i === cursor

                  return (
                    <div key={cmd.id}>
                      {showGroup && (
                        <div className="eyebrow px-2.5 pb-1 pt-3 first:pt-1">{cmd.group}</div>
                      )}
                      <button
                        data-interactive
                        data-active={active}
                        onMouseMove={() => setCursor(i)}
                        onClick={cmd.run}
                        className={cn(
                          'flex w-full items-center justify-between gap-4 rounded-lg px-2.5 py-2 text-left transition-colors duration-150',
                          active ? 'bg-signal/[0.08] text-text' : 'text-muted'
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span
                            className={cn(
                              'h-1 w-1 shrink-0 rounded-full transition-colors',
                              active ? 'bg-signal' : 'bg-line'
                            )}
                          />
                          <span className="truncate text-[13.5px]">{cmd.label}</span>
                        </span>
                        {cmd.hint && (
                          <span className="hidden shrink-0 truncate font-mono text-2xs text-dim sm:block sm:max-w-[240px]">
                            {cmd.hint}
                          </span>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center gap-4 border-t border-line px-4 py-2 font-mono text-2xs text-dim">
                <span className="flex items-center gap-1.5">
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd> navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>⏎</Kbd> select
                </span>
                <span className="ml-auto">{results.length} results</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
