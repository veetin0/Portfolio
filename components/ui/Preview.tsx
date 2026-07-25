import { hash, seeded } from '@/lib/utils'
import type { Project } from '@/data/types'

const W = 480
const H = 260
const LINES = 15
const STEPS = 46

/**
 * A deterministic ridgeline plot, seeded by the project id.
 *
 * Real screenshots always win — drop files in /public/shots and add a `media`
 * array to the project. This is what renders until you do, so a new project
 * never ships with a broken image or a grey rectangle.
 */
export function Preview({ project, className }: { project: Project; className?: string }) {
  const rand = seeded(hash(project.id))

  // Pre-roll: the first few values of an xorshift are poorly distributed.
  for (let i = 0; i < 8; i++) rand()

  const paths: string[] = []

  for (let l = 0; l < LINES; l++) {
    const baseY = 42 + (l / (LINES - 1)) * (H - 84)
    // Rows nearer the middle get more energy — gives the plot a focal point.
    const falloff = 1 - Math.abs(l / (LINES - 1) - 0.45) * 1.35
    const amp = 40 * Math.max(0.1, falloff)

    const raw: number[] = []
    for (let s = 0; s <= STEPS; s++) {
      const t = s / STEPS
      // Envelope keeps the ends flat so rows resolve into a clean baseline.
      const envelope = Math.sin(t * Math.PI) ** 1.6
      raw.push((rand() - 0.5) * 2 * amp * envelope)
    }

    // Two smoothing passes turn noise into something that reads as a signal.
    for (let pass = 0; pass < 2; pass++) {
      for (let s = 1; s < raw.length - 1; s++) {
        raw[s] = (raw[s - 1] + raw[s] * 2 + raw[s + 1]) / 4
      }
    }

    let d = ''
    for (let s = 0; s <= STEPS; s++) {
      const x = (s / STEPS) * W
      const y = baseY - raw[s]
      d += `${s === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    }
    // Close down to the baseline so each row can occlude the ones behind it.
    d += `L${W},${H}L0,${H}Z`
    paths.push(d)
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={`Generated visual identity for ${project.name}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width={W} height={H} fill="rgb(var(--raised))" />
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="rgb(var(--raised))"
          stroke={i % 3 === 0 ? 'rgb(var(--signal))' : 'rgb(var(--muted))'}
          strokeWidth={i % 3 === 0 ? 1.2 : 0.85}
          strokeOpacity={i % 3 === 0 ? 0.7 : 0.45}
          strokeLinejoin="round"
        />
      ))}
      {/* Fade the bottom so the plot sits in the card rather than on it. */}
      <rect width={W} height={H} fill="url(#preview-fade)" />
      <defs>
        <linearGradient id="preview-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--raised))" stopOpacity="0.5" />
          <stop offset="45%" stopColor="rgb(var(--raised))" stopOpacity="0" />
          <stop offset="100%" stopColor="rgb(var(--raised))" stopOpacity="0.85" />
        </linearGradient>
      </defs>
    </svg>
  )
}
