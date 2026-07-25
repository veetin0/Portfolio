'use client'

import { useMemo } from 'react'
import type { GraphNode } from '@/lib/graph'
import { neighboursOf } from '@/lib/graph'
import { useUI } from '@/lib/store'
import { cn } from '@/lib/utils'
import { StatusChip } from '@/components/ui/primitives'

export function ProjectNode({ node, index }: { node: GraphNode; index: number }) {
  const { project, x, y, w, h } = node

  const hoverNode = useUI((s) => s.hoverNode)
  const focusTag = useUI((s) => s.focusTag)
  const booted = useUI((s) => s.booted)
  const setHoverNode = useUI((s) => s.setHoverNode)
  const openAt = useUI((s) => s.openAt)

  const neighbours = useMemo(() => (hoverNode ? neighboursOf(hoverNode) : null), [hoverNode])

  const isHovered = hoverNode === project.id
  const isNeighbour = !!neighbours?.has(project.id)
  const matchesTag = !focusTag || project.stack.includes(focusTag)

  const dimmed = (!!focusTag && !matchesTag) || (!!hoverNode && !isHovered && !isNeighbour)

  return (
    <button
      data-interactive
      onClick={() => openAt(project.id)}
      onPointerEnter={() => setHoverNode(project.id)}
      onPointerLeave={() => setHoverNode(null)}
      onFocus={() => setHoverNode(project.id)}
      onBlur={() => setHoverNode(null)}
      aria-label={`Open ${project.name}`}
      className={cn(
        'group absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border text-left',
        'transition-[transform,opacity,border-color,box-shadow] duration-500 ease-out',
        'bg-raised/80 backdrop-blur-sm',
        isHovered ? 'border-signal/45 shadow-[0_0_0_1px_rgb(var(--signal)/0.12),0_20px_50px_-24px_rgb(var(--signal)/0.35)]' : 'border-line',
        dimmed ? 'opacity-25' : 'opacity-100',
        !dimmed && 'hover:-translate-y-[calc(50%+4px)]'
      )}
      style={{
        left: x,
        top: y,
        width: w,
        minHeight: h,
        // Nodes settle in one after another once the intro clears.
        transitionDelay: booted ? '0ms' : `${index * 45}ms`,
        transform: booted ? undefined : 'translate(-50%, calc(-50% + 14px))',
        ...(booted ? {} : { opacity: 0 }),
      }}
    >
      {/* Connector pip — visually anchors the node to its edges. */}
      <span
        aria-hidden
        className={cn(
          'absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full transition-colors duration-500',
          isHovered ? 'bg-signal' : 'bg-dim'
        )}
      />

      <div className="flex h-full flex-col gap-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-[15px] font-medium leading-none tracking-tight text-text">
            {project.name}
          </h3>
          <span className="font-mono text-2xs text-dim">{project.year}</span>
        </div>

        <p className="line-clamp-2 text-[12.5px] leading-snug text-muted">{project.tagline}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <StatusChip status={project.status} />
          <span className="flex items-center gap-2">
            {project.award && (
              <span
                title={project.award}
                aria-label={project.award}
                className="font-mono text-2xs text-signal"
              >
                ★
              </span>
            )}
            {project.downloads && (
              <span
                title="Downloadable"
                aria-label="Downloadable"
                className={cn(
                  'font-mono text-2xs transition-colors duration-300',
                  isHovered ? 'text-signal' : 'text-dim'
                )}
              >
                ↓
              </span>
            )}
            <span
              className={cn(
                'font-mono text-2xs transition-colors duration-300',
                isHovered ? 'text-signal' : 'text-dim'
              )}
            >
              {project.stack.length} deps
            </span>
          </span>
        </div>
      </div>

      {/* Hover sweep. Masked to the card, runs once per enter. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
      >
        <span
          className={cn(
            'absolute inset-y-0 -left-full w-full transition-transform duration-700 ease-out',
            'bg-gradient-to-r from-transparent via-signal/[0.06] to-transparent',
            isHovered && 'translate-x-[200%]'
          )}
        />
      </span>
    </button>
  )
}
