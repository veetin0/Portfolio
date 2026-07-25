'use client'

import { useEffect } from 'react'
import { sectors } from '@/data/sectors'
import { camera, clamp, panBy, ZOOM_MAX, ZOOM_MIN } from '@/lib/camera'
import { useUI } from '@/lib/store'

const PAN_STEP = 160

/**
 * Global keyboard layer. Mounted once; owns every shortcut so there's a single
 * place to check for conflicts.
 */
export function KeyBindings() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ui = useUI.getState()
      const target = e.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable

      // ⌘K works everywhere, including inside a field.
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        ui.toggleOverlay('palette')
        return
      }

      if (e.key === 'Escape') {
        // Let the terminal keep focus if it's the thing being dismissed.
        if (ui.overlay || ui.openProject) {
          e.preventDefault()
          ui.close()
        } else if (ui.focusTag) {
          ui.clearTag()
        }
        return
      }

      if (typing) return

      switch (e.key) {
        case '~':
        case '`':
          e.preventDefault()
          ui.toggleOverlay('terminal')
          return
        case '/':
          e.preventDefault()
          ui.setOverlay('palette')
          return
        case 'ArrowLeft':
          panBy(-PAN_STEP, 0)
          return
        case 'ArrowRight':
          panBy(PAN_STEP, 0)
          return
        case 'ArrowUp':
          panBy(0, -PAN_STEP)
          return
        case 'ArrowDown':
          panBy(0, PAN_STEP)
          return
        case '+':
        case '=':
          camera.tz = clamp(camera.tz * 1.15, ZOOM_MIN, ZOOM_MAX)
          return
        case '-':
        case '_':
          camera.tz = clamp(camera.tz / 1.15, ZOOM_MIN, ZOOM_MAX)
          return
      }

      // Number keys jump straight to a sector.
      const n = Number(e.key)
      if (!Number.isNaN(n) && n >= 0 && n < sectors.length) {
        ui.goTo(sectors[n].id)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return null
}
