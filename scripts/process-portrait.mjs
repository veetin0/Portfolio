/**
 * Turns a studio portrait on a white background into something that belongs on
 * a near-black canvas.
 *
 *   node scripts/process-portrait.mjs assets/portrait-source.jpg
 *
 * Writes public/portrait.webp. Re-run it any time you swap the photo — this is
 * the only step, and nothing about it is hand-tuned to one specific image.
 *
 * The pipeline, and why each step exists:
 *
 *   1. Flood-fill the background from the image border. A plain luminance
 *      threshold would also delete a white t-shirt; only white that is
 *      *connected to the edge* is background.
 *   2. Dilate that mask by a pixel. Hair edges are blends of white backdrop and
 *      dark hair, so keying alone leaves a bright fringe. Eating one pixel of
 *      the subject removes it.
 *   3. Blur the alpha channel so the cutout has a soft edge instead of jaggies.
 *   4. Desaturate, then lift only the highlights toward the signal green — a
 *      tint applied flat looks like a filter; applied to highlights it reads as
 *      the same light the rest of the page is lit by.
 *   5. Fade alpha out over the bottom of the frame, so the shoulders dissolve
 *      into the page rather than ending on a cut line.
 */

import sharp from 'sharp'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

// ── Tunables ────────────────────────────────────────────────────────
const OUT = 'public/portrait.webp'
const MAX_WIDTH = 900

/** Luma at or above this, and reachable from the border, counts as backdrop. */
const WHITE_CUTOFF = 244
/** Pixels of subject eaten to kill the white fringe around hair. */
const ERODE = 1
/** Alpha blur radius. Higher = softer cutout. */
const FEATHER = 0.8

/** Signal green, matched to --signal in globals.css. */
const TINT = [198, 242, 78]
/** How far highlights move toward the tint, at most. */
const TINT_STRENGTH = 0.12
/** Below this normalised luma, no tint at all. */
const TINT_FLOOR = 0.55

/** Fraction of the image height over which the bottom fades to nothing. */
const FADE_HEIGHT = 0.3
/** Contrast curve applied to the greyscale, around mid-grey. */
const CONTRAST = 1.06

const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

async function main() {
  const source = process.argv[2]

  if (!source) {
    console.error('usage: node scripts/process-portrait.mjs <path-to-photo>')
    process.exit(1)
  }
  if (!existsSync(source)) {
    console.error(`no such file: ${source}`)
    process.exit(1)
  }

  const input = sharp(source).rotate() // honour EXIF orientation
  const meta = await input.metadata()

  const { data, info } = await input
    .resize({ width: Math.min(MAX_WIDTH, meta.width ?? MAX_WIDTH), withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width: w, height: h, channels } = info
  const px = w * h

  // ── 1. Luma, and whatever transparency the source already had ─────
  // A PNG you cut out yourself (Preview → Instant Alpha, Photos → Remove
  // Background) gives far better hair edges than any luminance key. Respect
  // it: already-transparent pixels count as backdrop, and the source alpha
  // caps the final alpha so the cutout is never undone.
  const luma = new Float32Array(px)
  const srcAlpha = new Uint8Array(px)
  let hadTransparency = false

  for (let i = 0; i < px; i++) {
    const o = i * channels
    luma[i] = 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]
    srcAlpha[i] = data[o + 3]
    if (data[o + 3] < 250) hadTransparency = true
  }

  // ── 2. Flood fill the backdrop inward from every border pixel ─────
  const isBackdrop = new Uint8Array(px)
  const queue = new Int32Array(px)
  let head = 0
  let tail = 0

  const push = (i) => {
    if (isBackdrop[i]) return
    // Backdrop is either near-white, or already transparent in the source.
    if (luma[i] < WHITE_CUTOFF && srcAlpha[i] > 128) return
    isBackdrop[i] = 1
    queue[tail++] = i
  }

  // Seed from the top, left and right borders — deliberately NOT the bottom.
  // A portrait is cropped through the torso, so the bottom edge is subject,
  // not backdrop. Seeding there lets the fill crawl up a white t-shirt that
  // reaches the frame edge and erase the shirt. Real backdrop still gets
  // caught, because it always touches a side.
  for (let x = 0; x < w; x++) push(x)
  for (let y = 0; y < h; y++) {
    push(y * w)
    push(y * w + w - 1)
  }

  while (head < tail) {
    const i = queue[head++]
    const x = i % w
    const y = (i / w) | 0
    if (x > 0) push(i - 1)
    if (x < w - 1) push(i + 1)
    if (y > 0) push(i - w)
    if (y < h - 1) push(i + w)
  }

  // ── 3. Dilate the backdrop to remove the white fringe ─────────────
  let mask = isBackdrop
  for (let pass = 0; pass < ERODE; pass++) {
    const next = new Uint8Array(mask)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x
        if (mask[i]) continue
        if (
          (x > 0 && mask[i - 1]) ||
          (x < w - 1 && mask[i + 1]) ||
          (y > 0 && mask[i - w]) ||
          (y < h - 1 && mask[i + w])
        ) {
          next[i] = 1
        }
      }
    }
    mask = next
  }

  // ── 4. Recolour: greyscale, contrast, highlight tint ──────────────
  const rgb = Buffer.alloc(px * 3)
  const alpha = Buffer.alloc(px)

  const fadeStart = h * (1 - FADE_HEIGHT)

  for (let i = 0; i < px; i++) {
    const g = luma[i] / 255
    // Contrast around mid-grey.
    const c = Math.min(1, Math.max(0, (g - 0.5) * CONTRAST + 0.5))

    const t = smoothstep(TINT_FLOOR, 1, c) * TINT_STRENGTH
    const base = c * 255

    const o = i * 3
    rgb[o] = Math.round(base * (1 - t) + TINT[0] * t)
    rgb[o + 1] = Math.round(base * (1 - t) + TINT[1] * t)
    rgb[o + 2] = Math.round(base * (1 - t) + TINT[2] * t)

    // Source alpha caps the result: a hand-made cutout is never re-opened.
    let a = mask[i] ? 0 : srcAlpha[i]

    // Dissolve the bottom edge into the page.
    const y = (i / w) | 0
    if (a && y > fadeStart) {
      a = Math.round(a * (1 - smoothstep(fadeStart, h - 1, y)))
    }
    alpha[i] = a
  }

  // ── 5. Feather the cutout, then recombine ─────────────────────────
  // toColourspace('b-w') is load-bearing: without it sharp hands back a
  // 3-channel buffer for a 1-channel input, and reading it at stride 1 gives
  // you interleaved RGB — which looks like scanline corruption in the alpha.
  const softAlpha = await sharp(alpha, { raw: { width: w, height: h, channels: 1 } })
    .blur(FEATHER)
    .toColourspace('b-w')
    .raw()
    .toBuffer()

  if (softAlpha.length !== px) {
    throw new Error(`alpha blur returned ${softAlpha.length} bytes, expected ${px}`)
  }

  const out = Buffer.alloc(px * 4)
  for (let i = 0; i < px; i++) {
    out[i * 4] = rgb[i * 3]
    out[i * 4 + 1] = rgb[i * 3 + 1]
    out[i * 4 + 2] = rgb[i * 3 + 2]
    out[i * 4 + 3] = softAlpha[i]
  }

  mkdirSync(dirname(resolve(OUT)), { recursive: true })
  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .webp({ quality: 88, alphaQuality: 92, effort: 6 })
    .toFile(OUT)

  const kept = alpha.reduce((n, a) => n + (a > 0 ? 1 : 0), 0)
  console.log(
    `${OUT}  ${w}×${h}  ${((kept / px) * 100).toFixed(1)}% opaque` +
      (hadTransparency ? '  (source already had alpha — kept it)' : '  (keyed a white backdrop)')
  )

  if (!hadTransparency && kept / px > 0.97) {
    console.warn('\n  ⚠ Almost nothing was keyed out. Is the backdrop actually white?')
    console.warn('    Try raising WHITE_CUTOFF, or remove the background yourself first.')
  }
  if (kept / px < 0.12) {
    console.warn('\n  ⚠ Almost everything was keyed out — the subject may be too light.')
    console.warn('    Try lowering WHITE_CUTOFF.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
