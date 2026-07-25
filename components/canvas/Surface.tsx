'use client'

import { useEffect, useRef } from 'react'
import { sectors } from '@/data/sectors'
import {
  camera,
  clamp,
  clampTarget,
  panBy,
  ZOOM_MAX,
  ZOOM_MIN,
} from '@/lib/camera'
import { useUI } from '@/lib/store'
import { useReducedMotion } from '@/lib/hooks'

/** Pointer travel (px) past which a drag stops counting as a click. */
const DRAG_SLOP = 5

/**
 * Owns the single rAF loop and the single transform.
 *
 * Everything inside `children` is laid out in world coordinates; this
 * component is the only thing that knows where the viewport is pointing.
 */
export function Surface({ children }: { children: React.ReactNode }) {
  const worldRef = useRef<HTMLDivElement>(null)
  const nearRef = useRef<HTMLDivElement>(null)
  const farRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)

  const reduced = useReducedMotion()
  const setNearest = useUI((s) => s.setNearest)

  useEffect(() => {
    const world = worldRef.current
    const host = hostRef.current
    if (!world || !host) return

    let raf = 0
    let last = performance.now()
    let running = true

    const tick = (now: number) => {
      if (!running) return
      const dt = Math.min(64, now - last)
      last = now

      if (camera.mode === 'direct' || reduced) {
        camera.x = camera.tx
        camera.y = camera.ty
        camera.z = camera.tz
      } else {
        // Frame-rate independent easing: the same glide at 60 and 144Hz.
        const k = 1 - Math.pow(1 - 0.13, dt / 16.667)
        camera.x += (camera.tx - camera.x) * k
        camera.y += (camera.ty - camera.y) * k
        camera.z += (camera.tz - camera.z) * k
      }

      const { x, y, z } = camera
      world.style.transform = `translate3d(${-x * z}px, ${-y * z}px, 0) scale(${z})`

      // Parallax layers. Cheap: only background-position changes.
      if (nearRef.current) {
        nearRef.current.style.backgroundPosition = `${-x * 0.5}px ${-y * 0.5}px`
      }
      if (farRef.current) {
        farRef.current.style.backgroundPosition = `${-x * 0.18}px ${-y * 0.18}px`
      }

      // Which sector are we closest to? Only four candidates.
      let best = sectors[0]
      let bestD = Infinity
      for (const s of sectors) {
        const d = Math.hypot(x - s.at.x, y - s.at.y)
        if (d < bestD) {
          bestD = d
          best = s
        }
      }
      setNearest(best.id)
      host.dataset.adrift = bestD > 950 ? 'true' : 'false'

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      running = false
      cancelAnimationFrame(raf)
    }
  }, [reduced, setNearest])

  // ── Pointer panning ──────────────────────────────────────────────
  useEffect(() => {
    const host = hostRef.current
    const world = worldRef.current
    if (!host || !world) return

    let pointerId: number | null = null
    let lastX = 0
    let lastY = 0
    let travelled = 0

    const onDown = (e: PointerEvent) => {
      // Let interactive elements handle their own pointer events.
      if ((e.target as HTMLElement).closest('[data-interactive]')) return
      if (e.button !== 0) return

      pointerId = e.pointerId
      lastX = e.clientX
      lastY = e.clientY
      travelled = 0
      camera.mode = 'direct'
      host.setPointerCapture(e.pointerId)
      host.dataset.grabbing = 'true'
    }

    const onMove = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      travelled += Math.abs(dx) + Math.abs(dy)
      panBy(-dx / camera.z, -dy / camera.z)
    }

    const onUp = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return
      pointerId = null
      camera.mode = 'ease'
      host.dataset.grabbing = 'false'
      if (host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId)
    }

    // A drag that ends over a node must not also open that node. Swallow the
    // click in the capture phase, before it reaches the node's handler.
    const swallowClick = (e: MouseEvent) => {
      if (travelled > DRAG_SLOP) {
        e.stopPropagation()
        e.preventDefault()
        travelled = 0
      }
    }

    host.addEventListener('pointerdown', onDown)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerup', onUp)
    host.addEventListener('pointercancel', onUp)
    world.addEventListener('click', swallowClick, true)

    return () => {
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerup', onUp)
      host.removeEventListener('pointercancel', onUp)
      world.removeEventListener('click', swallowClick, true)
    }
  }, [])

  // ── Wheel: scroll pans, ⌘/ctrl + scroll zooms ────────────────────
  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest('[data-scrollable]')) return
      e.preventDefault()

      if (e.ctrlKey || e.metaKey) {
        camera.tz = clamp(camera.tz * (1 - e.deltaY * 0.006), ZOOM_MIN, ZOOM_MAX)
        camera.mode = 'ease'
        return
      }

      camera.mode = 'ease'
      // Trackpads send both axes; a mouse wheel only sends deltaY, so map it
      // to horizontal travel — the world is mostly laid out left to right.
      const horizontal = Math.abs(e.deltaX) > 0.5 ? e.deltaX : e.deltaY * 0.8
      const vertical = Math.abs(e.deltaX) > 0.5 ? e.deltaY : 0
      panBy(horizontal / camera.z, vertical / camera.z)
      clampTarget()
    }

    host.addEventListener('wheel', onWheel, { passive: false })
    return () => host.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div
      ref={hostRef}
      data-grabbing="false"
      data-adrift="false"
      className="fixed inset-0 overflow-hidden no-select touch-none [&[data-grabbing='true']]:cursor-grabbing cursor-grab"
    >
      {/* Parallax dot fields — pure CSS, so panning costs one style write. */}
      <div
        ref={farRef}
        aria-hidden
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: 'radial-gradient(rgb(var(--dim)/0.4) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
        }}
      />
      <div
        ref={nearRef}
        aria-hidden
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(rgb(var(--dim)/0.55) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Vignette — pulls the eye to the centre of the viewport. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 50%, transparent 30%, rgb(var(--bg)/0.75) 100%)',
        }}
      />

      <div ref={worldRef} className="absolute left-1/2 top-1/2 h-0 w-0 gpu origin-top-left">
        {children}
      </div>
    </div>
  )
}
