'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/lib/hooks'
import { lerp } from '@/lib/utils'

/**
 * A soft light that trails the cursor. Screen-space and pointer-events-none,
 * so it never interferes with the canvas underneath.
 *
 * The lag is the point — it makes the surface feel like it has depth rather
 * than a gradient stapled to the mouse.
 */
export function PointerLight() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const el = ref.current
    if (!el) return

    // Coarse pointers have no hover state; the effect is dead weight there.
    if (window.matchMedia('(pointer: coarse)').matches) return

    let tx = window.innerWidth / 2
    let ty = window.innerHeight / 2
    let x = tx
    let y = ty
    let raf = 0
    let visible = false

    const onMove = (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
      if (!visible) {
        visible = true
        el.style.opacity = '1'
      }
    }

    const tick = () => {
      x = lerp(x, tx, 0.075)
      y = lerp(y, ty, 0.075)
      el.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[1] h-[600px] w-[600px] opacity-0 transition-opacity duration-1000 gpu"
      style={{
        background:
          'radial-gradient(circle, rgb(var(--signal)/0.055) 0%, rgb(var(--signal)/0.018) 35%, transparent 68%)',
      }}
    />
  )
}
