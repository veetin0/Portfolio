/**
 * Skill groups for the STACK sector.
 *
 * `tag` must match the strings used in a project's `stack` array — that's how
 * the sector counts usage and cross-highlights the constellation. A skill with
 * no matching project still renders, it just shows a count of 0.
 */

export interface Skill {
  tag: string
  /** 0–1. Honest self-assessment, rendered as a bar. */
  level: number
}

export interface SkillGroup {
  id: string
  label: string
  note: string
  skills: Skill[]
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'frontend',
    label: 'Interface',
    note: 'Where most of my hours go.',
    skills: [
      { tag: 'React', level: 0.9 },
      { tag: 'Next.js', level: 0.88 },
      { tag: 'TypeScript', level: 0.85 },
      { tag: 'Tailwind', level: 0.9 },
      { tag: 'React Native', level: 0.68 },
      { tag: 'SwiftUI', level: 0.7 },
      { tag: 'MapLibre', level: 0.65 },
    ],
  },
  {
    id: 'backend',
    label: 'Data & Services',
    note: 'Schema first, endpoints second.',
    skills: [
      { tag: 'PostgreSQL', level: 0.78 },
      { tag: 'Prisma', level: 0.85 },
      { tag: 'Auth', level: 0.7 },
      { tag: 'Cron', level: 0.72 },
      { tag: 'Docker', level: 0.6 },
    ],
  },
  {
    id: 'ml',
    label: 'Machine Learning',
    note: 'Applied, not academic.',
    skills: [
      { tag: 'Python', level: 0.82 },
      { tag: 'Machine Learning', level: 0.65 },
      { tag: 'PyTorch', level: 0.55 },
      { tag: 'Whisper', level: 0.7 },
    ],
  },
  {
    id: 'systems',
    label: 'Systems & Native',
    note: 'The home lab counts as experience.',
    skills: [
      { tag: 'Swift', level: 0.72 },
      { tag: 'macOS', level: 0.8 },
      { tag: 'Linux', level: 0.75 },
      { tag: 'Networking', level: 0.7 },
      { tag: 'Raspberry Pi', level: 0.8 },
      { tag: 'Shell', level: 0.75 },
      { tag: 'Automation', level: 0.85 },
    ],
  },
]

/** Flat list, used by the command palette and terminal `stack`. */
export const allSkills = skillGroups.flatMap((g) => g.skills.map((s) => s.tag))
