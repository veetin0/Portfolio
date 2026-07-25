'use client'

import type { Project } from '@/data/types'
import { useUI } from '@/lib/store'
import { StatusChip } from '@/components/ui/primitives'
import { Preview } from '@/components/ui/Preview'

/**
 * Stacked-layout counterpart to <ProjectNode>. The constellation can't work on
 * a phone — there's no hover, no room to pan, and a graph you can't see all of
 * is just a maze. This is the same data as a list you can thumb through.
 */
export function ProjectCard({ project }: { project: Project }) {
  const openAt = useUI((s) => s.openAt)

  return (
    <button
      data-interactive
      onClick={() => openAt(project.id)}
      aria-label={`Open ${project.name}`}
      className="group relative flex w-full gap-4 overflow-hidden rounded-xl border border-line bg-raised/60 p-3 text-left transition-colors duration-300 active:border-signal/40"
    >
      <span className="relative h-[72px] w-[92px] shrink-0 overflow-hidden rounded-lg border border-line">
        {project.media?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.media[0].src}
            alt={project.media[0].alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <Preview project={project} className="h-full w-full" />
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[15px] font-medium tracking-tight text-text">
            {project.name}
          </span>
          <span className="shrink-0 font-mono text-2xs text-dim">{project.year}</span>
        </span>

        <span className="line-clamp-2 text-[12.5px] leading-snug text-muted">
          {project.tagline}
        </span>

        <span className="mt-auto flex items-center gap-3">
          <StatusChip status={project.status} />
          <span className="truncate font-mono text-2xs text-dim">
            {project.stack.slice(0, 3).join(' · ')}
          </span>
        </span>
      </span>
    </button>
  )
}
