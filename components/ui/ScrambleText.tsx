'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/hooks'

const GLYPHS = '▚▞abcdefghijklmnopqrstuvwxyz/\\<>[]{}=+*·'

/**
 * Resolves text left-to-right through a scramble. Used for the rotating
 * tagline and the terminal banner.
 *
 * Renders `text` directly on the server, so there's no hydration flash and no
 * layout shift — the effect only starts once the value actually changes.
 */
export function ScrambleText({
  text,
  className,
  speed = 28,
}: {
  text: string
  className?: string
  speed?: number
}) {
  const [display, setDisplay] = useState(text)
  const previous = useRef(text)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (previous.current === text) return
    previous.current = text

    if (reduced) {
      setDisplay(text)
      return
    }

    let frame = 0
    const total = text.length + 8
    let timer: ReturnType<typeof setInterval>

    timer = setInterval(() => {
      frame++
      // Characters lock in progressively; everything to the right is noise.
      const locked = Math.max(0, Math.floor(frame - 6))
      const out = text
        .split('')
        .map((ch, i) => {
          if (i < locked) return ch
          if (ch === ' ') return ' '
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        })
        .join('')

      setDisplay(out)
      if (frame >= total) {
        clearInterval(timer)
        setDisplay(text)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, reduced, speed])

  return (
    <span className={className}>
      {/* Announce the settled value, not the scramble. */}
      <span aria-hidden>{display}</span>
      <span className="sr-only">{text}</span>
    </span>
  )
}

/** Cycles through `items` on an interval. */
export function useRotating<T>(items: readonly T[], ms = 3200) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (items.length < 2) return
    const t = setInterval(() => setI((v) => (v + 1) % items.length), ms)
    return () => clearInterval(t)
  }, [items.length, ms])
  return items[i]
}
