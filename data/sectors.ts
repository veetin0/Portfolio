/**
 * Sectors are regions of the world canvas. `at` is world-space (px at zoom 1)
 * and the camera centres on it. Move a sector by editing `at` — nothing else
 * depends on the coordinates.
 */

export type SectorId = 'index' | 'work' | 'stack' | 'signal'

export interface Sector {
  id: SectorId
  /** Two-digit index shown in the rail. */
  ord: string
  label: string
  hint: string
  at: { x: number; y: number }
  /** Camera zoom when flying here. */
  zoom: number
}

export const sectors: Sector[] = [
  {
    id: 'index',
    ord: '00',
    label: 'Index',
    hint: 'Who this is',
    at: { x: 0, y: 0 },
    zoom: 1,
  },
  {
    id: 'work',
    ord: '01',
    label: 'Work',
    hint: 'Eight modules',
    at: { x: 1750, y: 60 },
    // Pulled back so the whole constellation is legible on arrival.
    zoom: 0.85,
  },
  {
    id: 'stack',
    ord: '02',
    label: 'Stack',
    hint: 'What I reach for',
    at: { x: 3450, y: -420 },
    zoom: 1,
  },
  {
    id: 'signal',
    ord: '03',
    label: 'Signal',
    hint: 'Log and contact',
    at: { x: 4980, y: 240 },
    zoom: 1,
  },
]

export const sectorById = new Map(sectors.map((s) => [s.id, s]))

/** Bounds of the explorable world, used by the minimap and pan clamping. */
export const WORLD = {
  minX: -900,
  maxX: 5900,
  minY: -1400,
  maxY: 1400,
}
