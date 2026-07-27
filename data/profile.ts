/**
 * Single source of truth for identity. Edit here — nothing else hardcodes these.
 */

export const profile = {
  name: 'Veeti Nurmikoski',
  handle: 'veeti',
  role: 'Computer Science Student',
  location: 'Finland',
  timezone: 'Europe/Helsinki',

  /** Shown once, big, on the index sector. Keep it to one breath. */
  statement:
    'I build software that feels considered — from the database schema up to the last 20 milliseconds of an animation.',

  /** Cycles under the name. Keep each under ~40 chars. */
  taglines: [
    'full-stack engineer',
    'interface obsessive',
    'ships weekend projects',
    'machine learning tinkerer',
    'builds with LLMs in the loop',
    'automates the boring parts',
    'runs his own DNS',
  ],

  /**
   * Produced by `npm run portrait -- <path-to-photo>`, which keys out a white
   * studio backdrop and tones the result for a dark page. Set to `undefined`
   * to drop the portrait entirely — nothing else needs changing.
   */
  portrait: {
    src: '/portrait.webp',
    alt: 'Veeti Nurmikoski',
  },

  /**
   * Drop the PDF at `public/cv/` and point at it here. Set to `undefined` and
   * the download row disappears — nothing else changes.
   *
   * Strip your home address and phone number first. A CV on a public URL gets
   * scraped; an email address is enough for anyone who actually wants to hire
   * you, and it's the one contact detail you can throw away later.
   */
  cv: {
    href: '/cv/veeti-nurmikoski-cv.pdf',
    label: 'Curriculum vitae',
    updated: 'July 2026',
  } as { href: string; label: string; updated?: string } | undefined,

  links: {
    github: 'https://github.com/veetin0',
    email: 'veeti.v.nurmikoski@gmail.com',
    linkedin: 'https://www.linkedin.com/in/veeti-nurmikoski-796a46328',
  },

  /**
   * Rendered as a boot log in the SIGNAL sector.
   * `highlight: true` marks an entry in the signal colour — for the handful of
   * lines that are an outcome someone else judged, not just a thing you did.
   */
  log: [
    {
      at: '2024',
      text: 'Started my studies with almost no code behind me — just a strong pull toward the field. What made it stick was realising how much ordinary infrastructure quietly runs on somebody’s software.',
    },
    {
      at: '2025',
      text: 'Second year. Made ML and AI the main line: agents are going to decide a great deal, and I would rather build them than watch.',
    },
    {
      at: '2025',
      text: 'Stopped waiting for coursework and started shipping my own projects — increasingly with an LLM in the loop, reviewing and verifying its output rather than trusting it.',
    },
    {
      at: '2026',
      text: 'Third place at the Koja Hackathon, with a team — HVAC control for a building simulated in EnergyPlus. My first hackathon.',
      highlight: true,
    },
    {
      at: '2026',
      text: 'IT support intern at the university — first role in the field, and still in it. Most of the tools here were built around it.',
    },
    { at: 'now', text: 'Looking for a team that cares about the details.' },
  ] as { at: string; text: string; highlight?: boolean }[],
} as const

export type Profile = typeof profile
