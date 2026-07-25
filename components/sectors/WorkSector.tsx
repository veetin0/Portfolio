'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { projects } from '@/data/projects'
import { graphEdges, graphNodes } from '@/lib/graph'
import { useUI } from '@/lib/store'
import { cn } from '@/lib/utils'
import { ProjectEdges } from '@/components/work/ProjectEdges'
import { ProjectNode } from '@/components/work/ProjectNode'

/**
 * The constellation. Rendered as world-positioned siblings rather than a
 * container, so the edge layer can sit behind every node without stacking
 * contexts fighting each other.
 */
export function WorkConstellation() {
  return (
    <>
      <ProjectEdges />
      {graphNodes.map((node, i) => (
        <ProjectNode key={node.project.id} node={node} index={i} />
      ))}
    </>
  )
}

/**
 * Contextual chrome for the work sector — screen-space, not world-space.
 *
 * It holds a control (the stack filter), and controls shouldn't drift off the
 * edge of a canvas you can pan. Fading it in on arrival also does the job a
 * heading would: telling you where you've landed and how to read it.
 */
export function WorkLegend() {
  const nearest = useUI((s) => s.nearest)
  const focusTag = useUI((s) => s.focusTag)
  const clearTag = useUI((s) => s.clearTag)
  const hoverNode = useUI((s) => s.hoverNode)

  const visible = nearest === 'work'
  const matching = focusTag ? projects.filter((p) => p.stack.includes(focusTag)).length : null

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="pane pointer-events-auto fixed bottom-[76px] left-4 z-30 hidden w-[300px] rounded-xl p-4 lg:block"
        >
          <div className="mb-3 flex items-center gap-2.5">
            <span className="font-mono text-2xs text-signal">01</span>
            <span className="eyebrow text-muted">Work</span>
            <span className="h-px flex-1 hairline" />
          </div>

          <h2 className="text-[17px] font-medium leading-tight tracking-tight">
            Selected modules
          </h2>

          <p className="mt-2 text-[12.5px] leading-relaxed text-muted text-pretty">
            Nodes are projects, lines are shared tooling. Hover to trace a
            neighbourhood, click to open.
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-3 font-mono text-2xs text-dim">
            <span>{projects.length} nodes</span>
            <span className="h-3 w-px bg-line" />
            <span>{graphEdges.length} links</span>

            {focusTag ? (
              <button
                data-interactive
                onClick={clearTag}
                className="flex items-center gap-1.5 rounded-full border border-signal/40 bg-signal/10 px-2 py-0.5 text-signal transition-colors hover:bg-signal/20"
              >
                {focusTag} · {matching}
                <span aria-hidden>×</span>
              </button>
            ) : (
              <span
                className={cn(
                  'truncate transition-opacity duration-300',
                  hoverNode ? 'opacity-100 text-muted' : 'opacity-0'
                )}
              >
                {hoverNode ?? ''}
              </span>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
