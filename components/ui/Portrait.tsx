'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * The processed portrait, sitting directly on the canvas with no frame.
 *
 * A border would fight the whole point: scripts/process-portrait.mjs keys the
 * backdrop out and fades the shoulders to nothing so the subject dissolves
 * into the page. Putting a box around that would just draw the edge back in.
 *
 * If the file is missing — you cloned the repo but never ran the script — this
 * renders nothing rather than a broken-image icon.
 */
export function Portrait({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  if (failed) return null

  return (
    <figure className={cn('relative shrink-0', className)}>
      {/* A pool of light behind the subject, so they read as lit by the page
          rather than pasted onto it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 scale-125"
        style={{
          background:
            'radial-gradient(55% 45% at 50% 32%, rgb(var(--signal)/0.06), transparent 72%)',
        }}
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        onError={() => setFailed(true)}
        className="w-full select-none object-contain"
      />
    </figure>
  )
}
