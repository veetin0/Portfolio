'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { profile } from '@/data/profile'
import { complete, execute, type Line } from '@/lib/commands'
import { useUI } from '@/lib/store'
import { cn } from '@/lib/utils'

const BANNER: Line[] = [
  { kind: 'dim', text: `${profile.handle}@portfolio — interactive shell` },
  { kind: 'dim', text: 'Type `help` to start. Tab completes, Esc closes.' },
]

const KIND_STYLE: Record<Line['kind'], string> = {
  in: 'text-text',
  out: 'text-muted',
  dim: 'text-dim',
  ok: 'text-signal',
  err: 'text-red-400/80',
}

export function Terminal() {
  const open = useUI((s) => s.overlay) === 'terminal'
  const close = useUI((s) => s.close)

  const [lines, setLines] = useState<Line[]>(BANNER)
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  // Pin to the bottom as output arrives.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines, open])

  const submit = () => {
    const input = value
    setValue('')
    if (!input.trim()) return

    setHistory((h) => [input, ...h].slice(0, 50))
    setHistoryIndex(-1)

    if (input.trim().toLowerCase() === 'clear') {
      setLines([])
      return
    }

    setLines((prev) => [...prev, { kind: 'in', text: input }, ...execute(input)])
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      const completed = complete(value)
      if (completed) setValue(completed)
      return
    }

    // Shell-style history. Index -1 means "the line I'm typing".
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(historyIndex + 1, history.length - 1)
      if (next >= 0) {
        setHistoryIndex(next)
        setValue(history[next])
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = historyIndex - 1
      setHistoryIndex(next)
      setValue(next >= 0 ? history[next] : '')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="Close terminal"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-bg/50 backdrop-blur-[2px]"
          />

          {/* Centring lives on a static wrapper: Framer writes an inline
              `transform` for `y`, which would override a -translate-x-1/2
              class and knock the panel off-centre. Sits above the rail. */}
          <div className="pointer-events-none fixed inset-x-0 bottom-[76px] z-[61] flex justify-center px-3">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Terminal"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => inputRef.current?.focus()}
              className="pane pointer-events-auto flex h-[min(440px,58vh)] w-[min(680px,100%)] flex-col overflow-hidden rounded-xl"
            >
              <header className="flex shrink-0 items-center gap-2 border-b border-line px-3.5 py-2">
                <span className="flex gap-1.5" aria-hidden>
                  <span className="h-2 w-2 rounded-full bg-line" />
                  <span className="h-2 w-2 rounded-full bg-line" />
                  <span className="h-2 w-2 rounded-full bg-signal/50" />
                </span>
                <span className="ml-1 font-mono text-2xs text-dim">
                  {profile.handle}@portfolio — zsh
                </span>
                <button
                  data-interactive
                  onClick={close}
                  aria-label="Close terminal"
                  className="ml-auto font-mono text-2xs text-dim transition-colors hover:text-signal"
                >
                  esc
                </button>
              </header>

              <div
                ref={scrollRef}
                data-scrollable
                className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 font-mono text-[12.5px] leading-[1.65]"
              >
                {lines.map((line, i) => (
                  <div
                    key={i}
                    className={cn('whitespace-pre-wrap break-words', KIND_STYLE[line.kind])}
                  >
                    {line.kind === 'in' && <span className="text-signal/70">❯ </span>}
                    {line.text || ' '}
                  </div>
                ))}

                <div className="flex items-center gap-2 pt-1">
                  <span aria-hidden className="text-signal/70">
                    ❯
                  </span>
                  <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={onKeyDown}
                    spellCheck={false}
                    autoComplete="off"
                    autoCapitalize="off"
                    aria-label="Terminal input"
                    className="flex-1 bg-transparent text-text caret-signal outline-none"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
