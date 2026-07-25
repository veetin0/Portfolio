'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { profile } from '@/data/profile'
import { sectors } from '@/data/sectors'
import { camera } from '@/lib/camera'
import { useUI } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Kbd } from '@/components/ui/primitives'

/** Top-left wordmark. Doubles as "go home". */
export function IdentityMark() {
  const goTo = useUI((s) => s.goTo)
  const booted = useUI((s) => s.booted)

  return (
    <button
      data-interactive
      onClick={() => goTo('index')}
      aria-label="Back to index"
      className={cn(
        'group pointer-events-auto fixed left-4 top-4 z-30 flex items-center gap-2.5',
        'transition-[opacity,transform] duration-700 ease-out',
        booted ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      )}
      style={{ transitionDelay: booted ? '640ms' : '0ms' }}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-raised/80 font-mono text-[11px] text-signal backdrop-blur transition-colors duration-300 group-hover:border-signal/40">
        {profile.name
          .split(' ')
          .map((w) => w[0])
          .join('')}
      </span>
      <span className="hidden text-[13px] tracking-tight text-muted transition-colors duration-300 group-hover:text-text sm:block">
        {profile.name}
      </span>
    </button>
  )
}

/**
 * Appears only when you've dragged away from every sector. The canvas is
 * free-roaming; this is the safety net that stops "explorable" from becoming
 * "lost".
 */
export function DriftHint() {
  const [adrift, setAdrift] = useState(false)
  const goTo = useUI((s) => s.goTo)
  const state = useRef(false)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      let nearest = Infinity
      for (const s of sectors) {
        nearest = Math.min(nearest, Math.hypot(camera.x - s.at.x, camera.y - s.at.y))
      }
      // Hysteresis — otherwise the hint flickers on the threshold.
      const next = state.current ? nearest > 760 : nearest > 980
      if (next !== state.current) {
        state.current = next
        setAdrift(next)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <AnimatePresence>
      {adrift && (
        // Static wrapper centres it; Framer owns the inline transform.
        <div className="pointer-events-none fixed inset-x-0 bottom-[76px] z-30 flex justify-center">
          <motion.button
            data-interactive
            onClick={() => goTo('index')}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pane pointer-events-auto rounded-full px-3.5 py-1.5 text-[12px] text-muted transition-colors hover:text-text"
          >
            Off the map — <span className="text-signal">click to return</span>
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  )
}

/** Brief CRT artefact fired by the terminal's `matrix` command. */
export function GlitchLayer() {
  const glitch = useUI((s) => s.glitch)
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (glitch === 0) return
    setOn(true)
    const t = setTimeout(() => setOn(false), 1400)
    return () => clearTimeout(t)
  }, [glitch])

  if (!on) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90] animate-pulse mix-blend-screen"
      style={{
        background:
          'repeating-linear-gradient(0deg, rgb(var(--signal)/0.07) 0px, transparent 2px, transparent 4px)',
      }}
    />
  )
}
