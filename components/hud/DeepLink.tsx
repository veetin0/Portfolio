'use client'

import { useEffect, useRef } from 'react'
import { projectById } from '@/data/projects'
import { sectorById, type SectorId } from '@/data/sectors'
import { jumpTo } from '@/lib/camera'
import { nodeById } from '@/lib/graph'
import { useUI } from '@/lib/store'

/**
 * Keeps the URL in step with where you are, and restores it on load.
 *
 * A canvas with no addresses can't be shared, bookmarked, or linked from an
 * application — "look at my ride sharing app" has to resolve to something.
 *   #work        a sector
 *   #p/lyvo      a project, panel open
 *
 * Restoring is a teleport rather than a flight: arriving from a link should
 * land you there, not make you watch the trip.
 */
export function DeepLink({ canvas }: { canvas: boolean }) {
  const nearest = useUI((s) => s.nearest)
  const openProject = useUI((s) => s.openProject)
  const restored = useRef(false)

  // Restore once, on first mount.
  useEffect(() => {
    if (restored.current) return
    restored.current = true

    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) return

    const ui = useUI.getState()

    if (hash.startsWith('p/')) {
      const project = projectById.get(hash.slice(2))
      if (!project) return
      if (canvas) {
        const node = nodeById.get(project.id)
        if (node) jumpTo(node.x, node.y, 1.05)
      } else {
        document.getElementById('work')?.scrollIntoView()
      }
      ui.openAt(project.id)
      return
    }

    const sector = sectorById.get(hash as SectorId)
    if (!sector) return

    if (canvas) {
      jumpTo(sector.at.x, sector.at.y, sector.zoom)
      ui.setNearest(sector.id)
    } else {
      document.getElementById(sector.id)?.scrollIntoView()
    }
  }, [canvas])

  // Reflect the current position. replaceState, not push — panning a canvas
  // shouldn't fill the back button with history.
  useEffect(() => {
    if (!restored.current) return
    const next = openProject ? `#p/${openProject}` : `#${nearest}`
    if (window.location.hash !== next) {
      window.history.replaceState(null, '', next)
    }
  }, [nearest, openProject])

  return null
}
