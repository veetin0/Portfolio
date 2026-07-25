'use client'

import { useMemo } from 'react'
import { graphEdges, nodeById, neighboursOf } from '@/lib/graph'
import { useUI } from '@/lib/store'

const PAD = 400

/**
 * The wiring between project nodes. One SVG for the whole constellation —
 * cheaper than a element per edge, and it lets edges render behind the cards
 * without any z-index juggling.
 */
export function ProjectEdges() {
  const hoverNode = useUI((s) => s.hoverNode)
  const focusTag = useUI((s) => s.focusTag)

  const box = useMemo(() => {
    const nodes = [...nodeById.values()]
    const xs = nodes.map((n) => n.x)
    const ys = nodes.map((n) => n.y)
    const minX = Math.min(...xs) - PAD
    const minY = Math.min(...ys) - PAD
    return {
      minX,
      minY,
      w: Math.max(...xs) - minX + PAD,
      h: Math.max(...ys) - minY + PAD,
    }
  }, [])

  const lit = useMemo(() => (hoverNode ? neighboursOf(hoverNode) : null), [hoverNode])

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute overflow-visible"
      style={{ left: box.minX, top: box.minY, width: box.w, height: box.h }}
      viewBox={`0 0 ${box.w} ${box.h}`}
    >
      {graphEdges.map((edge) => {
        const a = nodeById.get(edge.a)
        const b = nodeById.get(edge.b)
        if (!a || !b) return null

        const touchesHover =
          !!hoverNode &&
          (edge.a === hoverNode || edge.b === hoverNode) &&
          (lit?.has(edge.a) || lit?.has(edge.b) || true)

        const matchesTag = !!focusTag && edge.tags.includes(focusTag)
        const active = touchesHover || matchesTag

        // Anything not participating recedes rather than disappearing — the
        // shape of the network should stay readable.
        const dimmed = (hoverNode || focusTag) && !active

        return (
          <line
            key={`${edge.a}-${edge.b}`}
            x1={a.x - box.minX}
            y1={a.y - box.minY}
            x2={b.x - box.minX}
            y2={b.y - box.minY}
            stroke={active ? 'rgb(var(--signal))' : 'rgb(var(--dim))'}
            strokeWidth={active ? 1.25 : 0.75}
            strokeOpacity={dimmed ? 0.08 : active ? 0.5 : 0.28}
            strokeDasharray={edge.shared >= 4 ? undefined : '3 5'}
            className="transition-all duration-500 ease-out"
          />
        )
      })}
    </svg>
  )
}
