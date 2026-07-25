import { projects } from '@/data/projects'
import { sectorById } from '@/data/sectors'
import type { Project } from '@/data/types'

export interface GraphNode {
  project: Project
  /** World-space centre. */
  x: number
  y: number
  w: number
  h: number
}

export interface GraphEdge {
  a: string
  b: string
  /** Number of shared stack tags. Drives opacity and stroke width. */
  shared: number
  tags: string[]
}

const NODE_W = 236
const NODE_H = 128
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

/**
 * Deterministic layout: a phyllotaxis spiral seeded by weight (heavier
 * projects land nearer the centre), relaxed with a few passes of pairwise
 * repulsion so nothing overlaps.
 *
 * Deterministic matters — the constellation must look identical on the server
 * and the client, and identical between visits. No randomness, no physics tick.
 */
function layout(list: Project[]): GraphNode[] {
  const origin = sectorById.get('work')!.at

  const ordered = [...list].sort((a, b) => (b.weight ?? 1) - (a.weight ?? 1))

  const nodes: GraphNode[] = ordered.map((project, i) => {
    const weight = project.weight ?? 1
    const radius = 208 * Math.sqrt(i)
    const angle = i * GOLDEN
    return {
      project,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.72, // flatten — screens are wide
      w: NODE_W * (0.9 + weight * 0.1),
      h: NODE_H * (0.9 + weight * 0.1),
    }
  })

  // Relaxation. 90 passes is far more than needed for 8 nodes and still costs
  // well under a millisecond, so it stays honest as the list grows.
  for (let pass = 0; pass < 90; pass++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        const minX = (a.w + b.w) / 2 + 46
        const minY = (a.h + b.h) / 2 + 46
        const dx = b.x - a.x
        const dy = b.y - a.y

        // Only push apart if the bounding boxes actually overlap.
        const overlapX = minX - Math.abs(dx)
        const overlapY = minY - Math.abs(dy)
        if (overlapX <= 0 || overlapY <= 0) continue

        // Resolve along the cheaper axis.
        if (overlapX / minX < overlapY / minY) {
          const push = (overlapX / 2) * Math.sign(dx || 1)
          a.x -= push
          b.x += push
        } else {
          const push = (overlapY / 2) * Math.sign(dy || 1)
          a.y -= push
          b.y += push
        }
      }
    }
  }

  // Relaxation drags the cloud off its seed point, so re-centre it on its own
  // bounding box. Without this the camera lands on the sector coordinate and
  // the constellation sits visibly off to one side.
  const xs = nodes.map((n) => n.x)
  const ys = nodes.map((n) => n.y)
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2

  for (const n of nodes) {
    n.x += origin.x - cx
    n.y += origin.y - cy
  }

  return nodes
}

function sharedTags(a: Project, b: Project): string[] {
  const set = new Set(a.stack)
  return b.stack.filter((t) => set.has(t))
}

/**
 * Edges connect projects by shared tooling. Two or more shared tags is a real
 * relationship; below that it's noise. Any project left isolated gets a single
 * link to its closest relative so the constellation reads as one system.
 */
function buildEdges(nodes: GraphNode[]): GraphEdge[] {
  const edges: GraphEdge[] = []
  const degree = new Map<string, number>(nodes.map((n) => [n.project.id, 0]))

  const bump = (a: string, b: string) => {
    degree.set(a, (degree.get(a) ?? 0) + 1)
    degree.set(b, (degree.get(b) ?? 0) + 1)
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i].project
      const b = nodes[j].project
      const tags = sharedTags(a, b)
      if (tags.length >= 2) {
        edges.push({ a: a.id, b: b.id, shared: tags.length, tags })
        bump(a.id, b.id)
      }
    }
  }

  // A node with one connection reads as a dead end, and one with none reads as
  // a mistake. Top up anything under two links with its closest remaining
  // relatives — still a real relationship, just a weaker one, which the dashed
  // stroke in ProjectEdges already communicates.
  const MIN_DEGREE = 2
  const linked = new Set(edges.map((e) => [e.a, e.b].sort().join('~')))

  for (const node of nodes) {
    const id = node.project.id

    const candidates = nodes
      .filter((o) => o.project.id !== id && !linked.has([id, o.project.id].sort().join('~')))
      .map((o) => ({ id: o.project.id, tags: sharedTags(node.project, o.project) }))
      .filter((c) => c.tags.length > 0)
      .sort((a, b) => b.tags.length - a.tags.length)

    for (const candidate of candidates) {
      if ((degree.get(id) ?? 0) >= MIN_DEGREE) break
      edges.push({
        a: id,
        b: candidate.id,
        shared: candidate.tags.length,
        tags: candidate.tags,
      })
      linked.add([id, candidate.id].sort().join('~'))
      bump(id, candidate.id)
    }
  }

  return edges
}

export const graphNodes = layout(projects)
export const graphEdges = buildEdges(graphNodes)
export const nodeById = new Map(graphNodes.map((n) => [n.project.id, n]))

/** Every project that lists `tag` in its stack. */
export function projectsUsing(tag: string): Project[] {
  return projects.filter((p) => p.stack.includes(tag))
}

/** Neighbours of a project in the constellation, for hover highlighting. */
export function neighboursOf(id: string): Set<string> {
  const set = new Set<string>()
  for (const e of graphEdges) {
    if (e.a === id) set.add(e.b)
    if (e.b === id) set.add(e.a)
  }
  return set
}
