# Portfolio

An interactive portfolio built as a single spatial canvas rather than a set of
pages. Four **sectors** sit at fixed coordinates in a world you pan and zoom
through; projects are **nodes** in a constellation wired together by shared
tooling. Everything else — command palette, terminal, detail panel — floats
above it as HUD.

```
npm install
npm run dev        # http://localhost:3000
npm run build
npm run typecheck
npm run verify     # production build into .next-verify — safe while dev runs
npm run portrait   # regenerate public/portrait.webp from a photo
```

> **Run only one server at a time.** Every `next dev` and `next build` writes to
> the same `.next/` directory. Start a second `npm run dev` while one is already
> up — it will quietly fall back to port 3001 — and the two processes overwrite
> each other's chunks, which renders as an unstyled or half-broken page. Running
> `npm run build` alongside a live dev server does the same thing.
>
> If the page looks wrong: stop everything, clear the cache, start one.
>
> ```bash
> pkill -f "next dev" && rm -rf .next && npm run dev
> ```

## Adding a project

Append one object to [`data/projects.ts`](data/projects.ts). Nothing else needs
to change:

```ts
{
  id: 'my-thing',                       // URL-safe; also the terminal handle
  name: 'My Thing',
  tagline: 'One line, shown on the node',
  year: 2026,
  domain: 'web',                        // web | ai | tools | systems | games
  status: 'live',                       // live | active | prototype | archived
  summary: 'One or two sentences for the detail panel.',
  features: ['What it actually does', '…'],
  stack: ['Next.js', 'TypeScript'],     // drives the graph edges + filters
  links: [{ label: 'Source', href: '…', kind: 'github' }],
}
```

It is immediately laid out in the constellation, wired to its neighbours,
indexed by the command palette, openable from the terminal (`open my-thing`),
counted in the stack sector, deep-linkable at `#p/my-thing`, and included in
the server-rendered fallback.

**Spelling in `stack` matters.** Tags are matched literally, so `Next.js` and
`NextJS` are two different things. To make a tag appear in the stack sector
with a proficiency bar, add it to [`data/skills.ts`](data/skills.ts) using the
same string.

### Downloads

Put the file in `public/downloads/` and add:

```ts
downloads: [{
  href: '/downloads/my-thing-source.zip',
  label: 'Source archive',
  size: '1.2 MB',
  license: 'MIT',                 // shown as a badge on the button
  requires: 'Node 18+',
  note: 'Optional caveat, rendered as a notice under the button.',
}]
```

**Ship a `LICENSE` file inside the archive.** Without one, default copyright
means all rights reserved — anyone who downloads it legally cannot use or
modify it, which defeats the point of offering the download.

Strip build junk before zipping — `.DS_Store`, `node_modules`, `*.tsbuildinfo`,
and Xcode's `xcuserdata/` (its `.xcuserstate` embeds absolute paths from your
machine). Prefer shipping **source** over unsigned binaries: an unsigned macOS
app trips Gatekeeper, and telling strangers to bypass it is a bad habit to teach.

### Screenshots

Optional. Drop files in `public/shots/` and add:

```ts
media: [{ src: '/shots/my-thing.png', alt: 'The thing, running' }]
```

Without it, [`components/ui/Preview.tsx`](components/ui/Preview.tsx) draws a
deterministic ridgeline plot seeded by the project `id` — so a new project
never ships with a broken image.

## Portrait

The photo in the Signal sector is generated, not dropped in raw. A studio shot
on a white backdrop would be a bright rectangle on a near-black page, so it
gets processed first:

```bash
npm run portrait -- ~/path/to/photo.jpg   # writes public/portrait.webp
```

The script keys out the backdrop, desaturates, lifts the highlights slightly
toward the signal green, and fades the shoulders to nothing so the subject
dissolves into the page instead of ending on a cut line. Tunables are at the
top of [`scripts/process-portrait.mjs`](scripts/process-portrait.mjs).

Two things worth knowing:

- **The backdrop is found by flood-filling from the top and side borders**, not
  by a brightness threshold — a threshold would also delete a white t-shirt.
  The bottom border is deliberately not seeded, because a portrait is cropped
  through the torso and light clothing often reaches the frame edge.
- **If your photo doesn't have a clean white backdrop**, cut it out yourself
  first (macOS Preview → Instant Alpha, or Photos → Remove Background) and pass
  the transparent PNG. The script leaves existing transparency alone and still
  does the toning.

Commit the generated `public/portrait.webp` — deploys don't run the script.
Remove `portrait` from `data/profile.ts` and the section renders without it.

## Share identity

| File | What it is |
| --- | --- |
| `app/icon.svg` | Favicon. One glyph on purpose — browsers draw it at 16px and two letterforms turn to mush |
| `app/apple-icon.png` | iOS home screen, 180px, keeps the full monogram |
| `app/opengraph-image.tsx` | The 1200×630 card for LinkedIn/Slack/DMs, built from the same data and typeface as the page |
| `app/robots.ts`, `app/sitemap.ts` | Both read the origin from `lib/site.ts` |

**Set `NEXT_PUBLIC_SITE_URL` in production.** Everything above needs an absolute
origin — a relative `og:image` is ignored by every scraper. Without the variable
it falls back to Vercel's generated URL, and to localhost in dev.

Two Satori constraints worth knowing before editing the OG card, because both
fail the build rather than degrading:

- Any element with **more than one child** needs an explicit `display: flex`.
  JSX splits `{a} · {b}` into three children, so interpolate with a single
  template string instead.
- Fonts must be **ttf/otf/woff — not woff2**. Geist ships ttf locally, so no
  network access is needed at build time.

## CV

Drop a PDF at `public/cv/` and point `profile.cv` at it. The row hides itself
while the file is missing, so the site is deployable before the CV exists.

Strip your home address and phone number first — the folder is public and gets
scraped.

## Other content

| What | Where |
| --- | --- |
| Name, statement, taglines, links, timeline | `data/profile.ts` |
| Skill groups and proficiency | `data/skills.ts` |
| Sector names, world coordinates, zoom | `data/sectors.ts` |
| Terminal commands | `lib/commands.ts` |

## How it fits together

```
app/
  layout.tsx          fonts, metadata, pre-paint JS check
  page.tsx            → Shell
components/
  Shell.tsx           picks canvas vs stacked, mounts shared overlays
  StaticFallback.tsx  server-rendered plain HTML (crawlers, no-JS)
  canvas/             Surface (camera + rAF loop), WorldSlot, PointerLight
  sectors/            Index, Work, Stack, Signal
  work/               ProjectNode, ProjectEdges, ProjectPanel, ProjectCard
  hud/                SectorRail, Minimap, CommandPalette, Terminal,
                      KeyBindings, DeepLink, BootIntro
lib/
  camera.ts           camera state, lives outside React on purpose
  graph.ts            deterministic node layout + edge derivation
  store.ts            zustand UI state
  commands.ts         terminal command table
```

Two decisions worth knowing about:

**The camera is not React state.** A pan is a 60fps stream of updates; routing
that through `useState` would re-render the world tree every frame. `Surface`
runs one `requestAnimationFrame` loop that mutates `lib/camera.ts` and writes a
single `transform` to a single DOM node. Anything needing the live value (the
minimap, the drift hint) reads it in its own loop.

**Mobile gets a different layout, not a squeezed one.** Below 900px, `Shell`
renders `StackedLayout` — a normal scrolling document with native momentum and
no drag-vs-tap ambiguity. Same data, same components, same detail panel; only
the spatial metaphor is dropped, because it's the one thing a phone can't do
well.

## Keyboard

| Key | |
| --- | --- |
| `⌘K` / `/` | command palette |
| `` ` `` / `~` | terminal |
| `0`–`3` | jump to sector |
| arrows | pan · `+` `-` zoom |
| `esc` | close overlay, then clear filter |

The terminal takes `help`, `ls`, `open <id>`, `goto <sector>`, `stack [tag]`,
`whoami`, `contact`, `home`, `zoom`, `clear`, `exit` — plus a few undocumented
ones. Tab completes, `↑`/`↓` walks history.

## Deploy

Static-exportable as-is; `next build` produces a fully prerendered `/`.
Deploying to Vercel needs no configuration.
