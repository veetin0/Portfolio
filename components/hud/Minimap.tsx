'use client'

import { useEffect, useRef } from 'react'
import { sectors, WORLD } from '@/data/sectors'
import { graphNodes } from '@/lib/graph'
import { camera, flyTo } from '@/lib/camera'
import { useUI } from '@/lib/store'
import { cn } from '@/lib/utils'

const MAP_W = 184
const MAP_H = 76

const worldW = WORLD.maxX - WORLD.minX
const worldH = WORLD.maxY - WORLD.minY

const toMapX = (x: number) => ((x - WORLD.minX) / worldW) * MAP_W
const toMapY = (y: number) => ((y - WORLD.minY) / worldH) * MAP_H

/**
 * Orientation, not decoration. Once you can drag the world freely you need a
 * way to answer "where am I" without flying home — this is that.
 *
 * The viewport rect updates in its own rAF rather than through React, for the
 * same reason the camera does.
 */
export function Minimap() {
  const rectRef = useRef<SVGRectElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const booted = useUI((s) => s.booted)
  const nearest = useUI((s) => s.nearest)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const rect = rectRef.current
      if (rect) {
        const vw = window.innerWidth / camera.z
        const vh = window.innerHeight / camera.z
        rect.setAttribute('x', String(toMapX(camera.x - vw / 2)))
        rect.setAttribute('y', String(toMapY(camera.y - vh / 2)))
        rect.setAttribute('width', String(Math.max(6, (vw / worldW) * MAP_W)))
        rect.setAttribute('height', String(Math.max(5, (vh / worldH) * MAP_H)))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const jump = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return
    const box = svg.getBoundingClientRect()
    const px = (e.clientX - box.left) / box.width
    const py = (e.clientY - box.top) / box.height
    flyTo(WORLD.minX + px * worldW, WORLD.minY + py * worldH, camera.tz)
  }

  return (
    <div
      className={cn(
        'pointer-events-auto fixed right-4 top-4 z-30 hidden lg:block',
        'transition-[opacity,transform] duration-700 ease-out',
        booted ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      )}
      style={{ transitionDelay: booted ? '700ms' : '0ms' }}
    >
      <div className="pane rounded-lg p-2">
        <svg
          ref={svgRef}
          data-interactive
          onClick={jump}
          width={MAP_W}
          height={MAP_H}
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          className="cursor-crosshair overflow-visible"
          role="img"
          aria-label="Canvas minimap. Click to jump."
        >
          {/* Project nodes — the densest region reads as the work sector. */}
          {graphNodes.map((n) => (
            <circle
              key={n.project.id}
              cx={toMapX(n.x)}
              cy={toMapY(n.y)}
              r="1"
              fill="rgb(var(--dim))"
            />
          ))}

          {sectors.map((s) => (
            <g key={s.id}>
              <circle
                cx={toMapX(s.at.x)}
                cy={toMapY(s.at.y)}
                r={nearest === s.id ? 3 : 2}
                fill={nearest === s.id ? 'rgb(var(--signal))' : 'rgb(var(--muted))'}
                className="transition-all duration-300"
              />
              <text
                x={toMapX(s.at.x)}
                y={toMapY(s.at.y) - 6}
                textAnchor="middle"
                className="font-mono"
                fontSize="6"
                fill={nearest === s.id ? 'rgb(var(--signal))' : 'rgb(var(--dim))'}
              >
                {s.ord}
              </text>
            </g>
          ))}

          <rect
            ref={rectRef}
            rx="2"
            fill="rgb(var(--signal)/0.07)"
            stroke="rgb(var(--signal)/0.5)"
            strokeWidth="0.75"
          />
        </svg>
      </div>
    </div>
  )
}
