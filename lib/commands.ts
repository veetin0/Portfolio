import { projects, projectById } from '@/data/projects'
import { profile } from '@/data/profile'
import { sectors, sectorById, type SectorId } from '@/data/sectors'
import { skillGroups } from '@/data/skills'
import { camera, flyTo } from '@/lib/camera'
import { nodeById, projectsUsing } from '@/lib/graph'
import { useUI } from '@/lib/store'

export type LineKind = 'in' | 'out' | 'dim' | 'ok' | 'err'
export interface Line {
  kind: LineKind
  text: string
}

const out = (text: string): Line => ({ kind: 'out', text })
const dim = (text: string): Line => ({ kind: 'dim', text })
const ok = (text: string): Line => ({ kind: 'ok', text })
const err = (text: string): Line => ({ kind: 'err', text })

export interface Command {
  name: string
  args?: string
  help: string
  hidden?: boolean
  run: (args: string[]) => Line[]
}

/**
 * The terminal's command table.
 *
 * Every command reads from the same data the visual site does — there is no
 * second copy of the content here. Add a project to data/projects.ts and
 * `ls`, `open`, and `stack` all know about it immediately.
 */
export const commands: Command[] = [
  {
    name: 'help',
    help: 'List available commands',
    run: () => [
      dim('Available commands — arguments in <angle brackets>.'),
      ...commands
        .filter((c) => !c.hidden)
        .map((c) => out(`  ${(c.name + (c.args ? ` ${c.args}` : '')).padEnd(20)}${c.help}`)),
      dim(''),
      dim('Tab completes. ↑ / ↓ walks history. Esc closes.'),
    ],
  },

  {
    name: 'ls',
    help: 'List every module',
    run: () => {
      const idWidth = Math.max(...projects.map((p) => p.id.length)) + 2
      return [
        dim(`${projects.length} modules`),
        ...projects.map((p) =>
        // Width is derived, not guessed — a long id must not break the table.
          out(`  ${p.id.padEnd(idWidth)} ${String(p.year).padEnd(6)} ${p.status.padEnd(10)} ${p.tagline}`)
        ),
        dim(''),
        dim('open <id> for detail'),
      ]
    },
  },

  {
    name: 'open',
    args: '<module>',
    help: 'Fly to a module and open it',
    run: ([id]) => {
      if (!id) return [err('open: needs a module id. Try `ls`.')]
      const project = projectById.get(id.toLowerCase())
      if (!project) {
        const near = projects
          .map((p) => p.id)
          .filter((p) => p.includes(id.toLowerCase()) || id.toLowerCase().includes(p))
        return [
          err(`open: no module "${id}"`),
          ...(near.length ? [dim(`did you mean: ${near.join(', ')}`)] : []),
        ]
      }

      const node = nodeById.get(project.id)
      if (node) flyTo(node.x, node.y, 1.05)
      useUI.getState().openAt(project.id)
      return [ok(`opening ${project.name} — ${project.tagline}`)]
    },
  },

  {
    name: 'goto',
    args: '<sector>',
    help: 'Fly to a sector',
    run: ([id]) => {
      if (!id) return [err(`goto: needs a sector. One of: ${sectors.map((s) => s.id).join(', ')}`)]
      const key = id.toLowerCase() as SectorId
      if (!sectorById.has(key)) return [err(`goto: unknown sector "${id}"`)]
      useUI.getState().goTo(key)
      return [ok(`→ ${sectorById.get(key)!.label}`)]
    },
  },

  {
    name: 'stack',
    args: '[tag]',
    help: 'Show the stack, or filter modules by tag',
    run: ([tag]) => {
      if (!tag) {
        return skillGroups.flatMap((g) => [
          dim(`${g.label}`),
          out(`  ${g.skills.map((s) => s.tag).join(' · ')}`),
        ])
      }

      const matched = projectsUsing(
        // Case-insensitive lookup against the canonical tag spelling.
        skillGroups
          .flatMap((g) => g.skills.map((s) => s.tag))
          .find((t) => t.toLowerCase() === tag.toLowerCase()) ?? tag
      )

      if (!matched.length) return [err(`stack: nothing uses "${tag}"`)]

      const canonical = matched[0].stack.find((t) => t.toLowerCase() === tag.toLowerCase()) ?? tag
      useUI.getState().pinTag(canonical)
      useUI.getState().goTo('work')
      return [
        ok(`${matched.length} module${matched.length > 1 ? 's' : ''} use ${canonical}`),
        ...matched.map((p) => out(`  ${p.id.padEnd(16)} ${p.name}`)),
      ]
    },
  },

  {
    name: 'whoami',
    help: 'Identity readout',
    run: () => [
      out(`${profile.name}`),
      dim(`${profile.role} · ${profile.location}`),
      out(''),
      out(profile.statement),
      out(''),
      dim(`github    ${profile.links.github}`),
      dim(`email     ${profile.links.email}`),
    ],
  },

  {
    name: 'contact',
    help: 'Copy the email address to your clipboard',
    run: () => {
      void navigator.clipboard?.writeText(profile.links.email)
      return [ok(`copied ${profile.links.email} to clipboard`)]
    },
  },

  {
    name: 'home',
    help: 'Return to the index sector',
    run: () => {
      useUI.getState().goTo('index')
      return [ok('→ Index')]
    },
  },

  {
    name: 'zoom',
    args: '<0.4–1.6>',
    help: 'Set the camera zoom',
    run: ([v]) => {
      const z = Number(v)
      if (!v || Number.isNaN(z)) return [err('zoom: expects a number, e.g. `zoom 0.6`')]
      flyTo(camera.tx, camera.ty, z)
      return [ok(`zoom → ${camera.tz.toFixed(2)}`)]
    },
  },

  {
    name: 'clear',
    help: 'Clear the terminal',
    run: () => [],
  },

  {
    name: 'exit',
    help: 'Close the terminal',
    run: () => {
      useUI.getState().setOverlay(null)
      return []
    },
  },

  // ── Easter eggs. Undocumented on purpose. ────────────────────────
  {
    name: 'sudo',
    hidden: true,
    help: '',
    run: (args) => [
      err(`${profile.handle} is not in the sudoers file.`),
      dim('This incident has been reported.'),
      ...(args.length ? [dim(`(it was going to be: ${args.join(' ')})`)] : []),
    ],
  },
  {
    name: 'matrix',
    hidden: true,
    help: '',
    run: () => {
      useUI.getState().fireGlitch()
      return [ok('wake up…')]
    },
  },
  {
    name: 'coffee',
    hidden: true,
    help: '',
    run: () => [err('418 — I’m a teapot'), dim('Try again after a compile.')],
  },
  {
    name: 'rm',
    hidden: true,
    help: '',
    run: (args) =>
      args.includes('-rf')
        ? [err('Nice try.'), dim('The canvas is immutable. Everything here is in git.')]
        : [err('rm: read-only filesystem')],
  },
  {
    name: 'ping',
    hidden: true,
    help: '',
    run: ([host]) => [
      dim(`PING ${host || 'localhost'} — 3 packets`),
      out('  time=0.4ms'),
      out('  time=0.3ms'),
      out('  time=0.4ms'),
      ok('0% packet loss. The Pi is still up.'),
    ],
  },
]

const byName = new Map(commands.map((c) => [c.name, c]))

export function execute(input: string): Line[] {
  const trimmed = input.trim()
  if (!trimmed) return []

  const [name, ...args] = trimmed.split(/\s+/)
  const command = byName.get(name.toLowerCase())

  if (!command) {
    return [
      err(`command not found: ${name}`),
      dim('Type `help` for the list.'),
    ]
  }

  return command.run(args)
}

/** Tab completion: command names first, then the argument vocabulary. */
export function complete(input: string): string | null {
  const parts = input.split(/\s+/)

  if (parts.length <= 1) {
    const hits = commands.filter((c) => !c.hidden && c.name.startsWith(parts[0]))
    return hits.length === 1 ? hits[0].name + ' ' : null
  }

  const vocabulary: Record<string, string[]> = {
    open: projects.map((p) => p.id),
    goto: sectors.map((s) => s.id),
    stack: skillGroups.flatMap((g) => g.skills.map((s) => s.tag)),
  }

  const options = vocabulary[parts[0].toLowerCase()]
  if (!options) return null

  const last = parts[parts.length - 1].toLowerCase()
  const hits = options.filter((o) => o.toLowerCase().startsWith(last))
  if (hits.length !== 1) return null

  return [...parts.slice(0, -1), hits[0]].join(' ') + ' '
}
