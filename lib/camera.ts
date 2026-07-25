import { WORLD } from '@/data/sectors'

/**
 * The camera lives outside React on purpose.
 *
 * A pan is a 60fps stream of updates; routing that through component state
 * would re-render the whole world tree every frame. Instead `Surface` runs a
 * single rAF loop that mutates this object and writes one transform to one
 * DOM node. Anything that needs the live value (the minimap, the drift hint)
 * reads it from here inside its own loop.
 */
export interface CameraState {
  /** Current, interpolated. */
  x: number
  y: number
  z: number
  /** Target. Set these; the loop eases toward them. */
  tx: number
  ty: number
  tz: number
  /** 'direct' snaps (pointer drag), 'ease' glides (fly-to). */
  mode: 'direct' | 'ease'
}

export const camera: CameraState = {
  x: 0,
  y: 0,
  z: 1,
  tx: 0,
  ty: 0,
  tz: 1,
  mode: 'ease',
}

export const ZOOM_MIN = 0.35
export const ZOOM_MAX = 1.6

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Keeps the viewport inside WORLD so you can never pan into the void. */
export function clampTarget() {
  camera.tz = clamp(camera.tz, ZOOM_MIN, ZOOM_MAX)
  camera.tx = clamp(camera.tx, WORLD.minX, WORLD.maxX)
  camera.ty = clamp(camera.ty, WORLD.minY, WORLD.maxY)
}

export function flyTo(x: number, y: number, z = 1) {
  camera.tx = x
  camera.ty = y
  camera.tz = z
  camera.mode = 'ease'
  clampTarget()
}

/** Teleport with no glide — used when restoring position from a URL. */
export function jumpTo(x: number, y: number, z = 1) {
  flyTo(x, y, z)
  camera.x = camera.tx
  camera.y = camera.ty
  camera.z = camera.tz
}

export function panBy(dx: number, dy: number) {
  camera.tx += dx
  camera.ty += dy
  clampTarget()
}

/** Distance from the current camera to a point, in world units. */
export function distanceTo(x: number, y: number) {
  return Math.hypot(camera.x - x, camera.y - y)
}

/** Screen point → world point, given the viewport size. */
export function screenToWorld(sx: number, sy: number, vw: number, vh: number) {
  return {
    x: camera.x + (sx - vw / 2) / camera.z,
    y: camera.y + (sy - vh / 2) / camera.z,
  }
}
