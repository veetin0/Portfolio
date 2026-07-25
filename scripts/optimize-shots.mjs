/**
 * Compresses everything in public/shots to WebP.
 *
 *   npm run shots
 *
 * Screenshots come off a retina display at ~2500px wide and several megabytes
 * each. The panel renders them in a 460px box, so the raw file is roughly five
 * times wider than it can ever display and costs a visitor a multi-megabyte
 * download for a thumbnail.
 *
 * Originals are left alone — this writes a .webp beside each one. Point the
 * `media` entries at the .webp and the PNGs can be deleted or kept out of git.
 *
 * Safe to re-run: it skips anything already converted and unchanged.
 */

import sharp from 'sharp'
import { readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, parse } from 'node:path'

const DIR = 'public/shots'

/** Wide enough for a 460px panel at 2×, and for a lightbox later. */
const MAX_WIDTH = 1600
const QUALITY = 82

const kb = (n) => `${(n / 1024).toFixed(0)} KB`

async function main() {
  if (!existsSync(DIR)) {
    console.error(`no such directory: ${DIR}`)
    process.exit(1)
  }

  const files = (await readdir(DIR)).filter((f) => /\.(png|jpe?g)$/i.test(f))

  if (!files.length) {
    console.log(`nothing to do — no png/jpg in ${DIR}`)
    return
  }

  let before = 0
  let after = 0

  for (const file of files) {
    const src = join(DIR, file)
    const out = join(DIR, `${parse(file).name}.webp`)

    const srcStat = await stat(src)
    const meta = await sharp(src).metadata()

    await sharp(src)
      .resize({ width: Math.min(MAX_WIDTH, meta.width ?? MAX_WIDTH), withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(out)

    const outStat = await stat(out)
    before += srcStat.size
    after += outStat.size

    const saved = (1 - outStat.size / srcStat.size) * 100
    console.log(
      `  ${file.padEnd(22)} ${String(meta.width).padStart(4)}px ${kb(srcStat.size).padStart(8)}` +
        `  →  ${parse(file).name}.webp ${kb(outStat.size).padStart(8)}  −${saved.toFixed(0)}%`
    )
  }

  console.log(
    `\n  ${files.length} file(s): ${kb(before)} → ${kb(after)} ` +
      `(−${((1 - after / before) * 100).toFixed(0)}%)`
  )
  console.log(`  Point \`media\` at the .webp paths in data/projects.ts.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
