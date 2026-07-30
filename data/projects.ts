import type { Project } from './types'

/**
 * ─────────────────────────────────────────────────────────────
 *  ADDING A PROJECT
 * ─────────────────────────────────────────────────────────────
 *  1. Append an object to this array. `id`, `name`, `tagline`,
 *     `year`, `domain`, `status`, `summary`, `features`, `stack`
 *     are required — everything else is optional.
 *  2. That's it. The constellation lays it out, the graph wires
 *     up its edges from `stack`, the command palette indexes it,
 *     the terminal can `open` it, and the stack sector counts it.
 *
 *  Nothing below this file needs to change.
 * ─────────────────────────────────────────────────────────────
 */

export const projects: Project[] = [
  {
    id: 'lyvo',
    name: 'Lyvo',
    tagline: 'Ride sharing, without the friction',
    year: 2025,
    domain: 'web',
    status: 'live',
    weight: 1.4,
    summary:
      'A ride sharing platform built around the idea that posting a ride should take fifteen seconds. Drivers publish a route, passengers match against it by proximity rather than exact endpoints, and the whole booking flow happens without leaving the map.',
    features: [
      'Route-aware matching — passengers match anywhere along a driver’s path, not just at endpoints',
      'Live map with clustered pickup points and draggable waypoints',
      'Seat inventory with optimistic booking and automatic rollback on conflict',
      'Row-level authorization enforced in Prisma middleware, not in the UI',
      'Email + OAuth auth with session rotation',
    ],
    stack: ['Next.js', 'TypeScript', 'React', 'Tailwind', 'Prisma', 'PostgreSQL', 'Mapbox', 'Auth'],
    metrics: [
      { label: 'Languages', value: 'FI / EN / SV' },
      { label: 'Status', value: 'deployed' },
    ],
    links: [
      { label: 'lyvo-web.vercel.app', href: 'https://lyvo-web.vercel.app', kind: 'demo' },
      { label: 'veetin0/lyvo-web', href: 'https://github.com/veetin0/lyvo-web', kind: 'github' },
    ],
    media: [{ src: '/shots/lyvo.webp', alt: 'Lyvo home screen' }],
  },

  {
    id: 'kickoff',
    name: 'Football Predictions',
    tagline: 'A prediction league that scores itself',
    year: 2026,
    domain: 'web',
    status: 'prototype',
    weight: 1.1,
    summary:
      'A prediction game for football fixtures: lock in a scoreline before kickoff, have results settle automatically after full time, and let the leaderboard recompute itself instead of living in a spreadsheet. In progress.',
    features: [
      'Predictions lock at kickoff, enforced server-side',
      'Fixtures and results ingested on a schedule rather than entered by hand',
      'Scoring weighted by how close the guess was, not just win/lose',
    ],
    stack: ['Next.js', 'TypeScript', 'React', 'Tailwind', 'Prisma', 'PostgreSQL', 'Cron'],
  },

  {
    id: 'atlas',
    name: 'Fun With Flags',
    tagline: 'An offline-first geography game on a real vector map',
    year: 2026,
    domain: 'games',
    status: 'live',
    weight: 1.15,
    summary:
      'A flag appears, you pan and zoom an interactive world map, click the country and confirm with Space. Every polygon is real Natural Earth geometry, so clicks hit actual borders rather than a picture of them — and once you have loaded it once, the whole game runs with no connection at all.',
    features: [
      'Zero runtime network requests — GeoJSON, 237 flags and fonts are all bundled, with a service worker caching the rest',
      'MapLibre feature-state for hover, selection, elimination and reveal, so paint updates stay GPU-cheap',
      'Labels are DOM markers at Natural Earth anchors: no glyph server, zoom-scaled, greedy collision culling so names never overlap',
      'Generous invisible hitboxes for 67 small countries and islands, so Malta and the Faroes are clickable at world zoom',
      'Six modes (Classic, Timed, Survival, Endless, Region, Hardcore) built as presets layered over your own settings',
      'Configurable scoring: max score, full-score threshold, time decay, wrong-guess penalty — or fixed points per round',
    ],
    stack: ['React', 'TypeScript', 'Tailwind', 'MapLibre', 'Zustand', 'Vite', 'GeoJSON'],
    metrics: [
      { label: 'Countries', value: '236' },
      { label: 'Modes', value: '6' },
      { label: 'Offline', value: 'fully' },
    ],
    downloads: [
      {
        href: '/downloads/atlas-fun-with-flags-source.zip',
        label: 'Source archive',
        size: '1.2 MB',
        license: 'MIT',
        requires: 'Node 18+ · npm install && npm run dev',
        note:
          'MIT covers my code. The 237 bundled flags are from flag-icons (MIT, © Panayiotis Lipiridis) and the country geometry is Natural Earth (public domain) — see THIRD-PARTY-NOTICES.md in the archive, and keep it with any copy you pass on.',
      },
    ],
    media: [{ src: '/shots/FunWithFlags.webp', alt: 'Interactive world map engineered for smoothness' }],
  },

  {
    id: 'scribe',
    name: 'Scribe',
    tagline: 'Speech to text that never leaves the machine',
    year: 2026,
    domain: 'ai',
    status: 'prototype',
    weight: 1.15,
    summary:
      'A speech-to-text tool that runs entirely on the machine. Every good dictation tool I found wanted a subscription and an upload, so this one does local Whisper inference and never opens a socket. In progress.',
    features: [
      'Local Whisper inference — audio never leaves the machine',
      'Transcript export with timestamps',
    ],
    stack: ['Python', 'Whisper', 'PyTorch', 'FFmpeg', 'Machine Learning'],
  },

  {
    id: 'jiggler',
    name: 'Jiggler',
    tagline: 'A USB tool that keeps the session alive',
    year: 2026,
    domain: 'tools',
    status: 'prototype',
    weight: 0.95,
    summary:
      'An IT support utility that runs from a USB stick: plug it into a locked-down machine, get a small GUI, and keep a session from idling out during a long remote job. Built for the support desk, so it has to work with no install and no admin rights. In progress.',
    features: [
      'Runs portable from the stick — no installation, no admin prompt',
      'Small GUI rather than a background process you cannot see or stop',
    ],
    stack: ['Python', 'Tkinter', 'Automation', 'Windows'],
  },

  {
    id: 'command-center',
    name: 'Command Center',
    tagline: 'A launcher, dashboard and system monitor for macOS',
    year: 2026,
    domain: 'tools',
    status: 'live',
    weight: 1.2,
    summary:
      'A customizable macOS launcher built entirely in Swift and SwiftUI: Stream Deck-style tiles you configure yourself, a Spotlight-style search across apps, files and your own actions, and a live system monitor — all summoned with one hotkey.',
    features: [
      'Tile dashboard with custom labels, SF Symbols, accent colours and Launchpad-style drag & drop reordering',
      'Actions launch apps, run shell commands, open paths, execute AppleScript, or chain any of those into multi-step workflows',
      'Spotlight-style search over installed apps, real Spotlight file results via NSMetadataQuery, and your own actions — fully keyboard-driven',
      'Global hotkeys: ⌥Space summons the window, and every tile can record its own system-wide shortcut',
      'System panel reading battery via IOKit, CPU from Mach tick deltas, memory from vm statistics, refreshed every 2s',
      'Menu bar popover with quick stats and your six most-used tiles',
      'Profiles and pages, persisted as human-readable JSON in Application Support',
    ],
    stack: ['Swift', 'SwiftUI', 'macOS', 'AppleScript', 'Automation', 'IOKit'],
    metrics: [
      { label: 'Language', value: '100% Swift' },
      { label: 'Requires', value: 'macOS 14' },
      { label: 'Deps', value: 'none' },
    ],
    downloads: [
      {
        href: '/downloads/command-center-source.zip',
        label: 'Source archive',
        size: '66 KB',
        license: 'MIT',
        requires: 'macOS 14 Sonoma · Xcode 15+',
        note:
          'Ships as source, not a signed binary. Command Center runs shell commands and AppleScript you configure, so it is deliberately unsandboxed — build it yourself and you can read exactly what it does first.',
      },
    ],
    media: [{ src: '/shots/CommandCenter.webp', alt: 'Command Center home screen' }],
  },

  {
    id: 'mpv-gui',
    name: 'MPV GUI',
    tagline: 'A native macOS front end for mpv',
    year: 2026,
    domain: 'tools',
    status: 'live',
    weight: 0.9,
    attribution:
      'mpv itself is not my project — it is an established open-source player by the mpv team. This is a macOS interface built on top of it; the playback engine is entirely theirs.',
    summary:
      'mpv is an excellent video player with almost no interface. This is a native macOS shell over it — a real UI for a player that normally expects you to memorise keybindings and edit a config file.',
    features: [
      'Wraps upstream mpv rather than forking or reimplementing playback',
      'Built as a native macOS app in Xcode',
    ],
    stack: ['Swift', 'macOS', 'IPC', 'Automation'],
    links: [
      { label: 'mpv-player/mpv (upstream)', href: 'https://github.com/mpv-player/mpv', kind: 'upstream' },
    ],
    // No download: the folder you pointed me at holds only an empty Xcode
    // workspace — none of your GUI source is in it. Add the real source and
    // this gets a download button like the other two.
  },

  {
    id: 'koja-hackathon',
    name: 'HVAC Control Agent',
    tagline: 'Heating a building for less, without making anyone cold',
    year: 2026,
    domain: 'ai',
    status: 'archived',
    weight: 1.25,
    award: '3rd place · Koja Hackathon 2026',
    attribution:
      'A team of six, with roughly equal contribution across the group — the commit history shows only two names because we pushed from shared machines. My own work was the search for good controller values: ML to explore the parameter space, narrowing it to the ranges worth testing, plus research and helpers the rest of the team built on. The EnergyPlus model, weather data and controller scaffolding were supplied by Koja.',
    summary:
      'A one-day competition run by Koja: control the heating and ventilation of a simulated five-zone office and get the lowest total cost, where cost is energy plus penalties for letting the temperature drift or the CO₂ climb. Three objectives that actively fight each other — the cheapest building is the one nobody can work in.',
    features: [
      'Three controllers compared against one EnergyPlus building model: ventilation always-on, a scheduled rule-based controller, and a reinforcement-learning agent',
      'Rule-based controller doing CO₂-demand flow control, return-air compensation and outdoor-temperature-driven zone setpoints',
      'RL agent trained with stable-baselines3 over a gymnasium environment wrapping the simulator, warm-started by behavioural cloning from the rule-based runs',
      'Scored on a single number: energy use plus thermal-comfort and air-quality penalties',
      'Full-year simulation runs compared in a notebook to see where each controller actually lost its points',
    ],
    stack: [
      'Python',
      'Machine Learning',
      'PyTorch',
      'Reinforcement Learning',
      'EnergyPlus',
      'pandas',
    ],
    metrics: [
      { label: 'Placed', value: '3rd' },
      { label: 'Team', value: '6' },
      { label: 'Objectives', value: '3' },
    ],
    // No download or repo link: the folder is mostly Koja's template, their
    // task-description PDFs, and 368 generated EnergyPlus output files. None of
    // that is mine to redistribute.
  },

  {
    id: 'gymplus',
    name: 'GymPlus',
    tagline: 'A training log that generates the program too',
    year: 2026,
    domain: 'mobile',
    status: 'prototype',
    weight: 1.05,
    summary:
      'A React Native training app: answer three questions about your goal, experience and how many days you can train, and it builds an eight-week program you can actually run. Logging, progression and progress charts all work offline — the app makes no network calls of its own.',
    features: [
      'Program generator builds an 8-week block from goal × days-per-week, with sets, reps and rest tuned per goal (5×5 at 3min for strength, 3×15 at 60s for fat loss)',
      'Local exercise database of 180 movements tagged by muscle, equipment, difficulty, secondary muscles and cues',
      'Live workout screen with per-set logging, rest timers and completion state',
      'Estimated 1RM via the Epley formula, session volume, and weekly volume broken down by muscle group',
      'Progression suggestions — hit the target reps and it proposes the next load',
      'Everything persists to AsyncStorage, with JSON backup export and re-import so the data is yours',
      'No accounts, no sync, no analytics — the only thing that ever leaves the phone is the store’s own rating sheet',
    ],
    stack: ['React Native', 'Expo', 'JavaScript', 'React'],
    metrics: [
      { label: 'Exercises', value: '180' },
      { label: 'Templates', value: '9' },
      { label: 'Accounts', value: 'none' },
    ],
  },

  {
    id: 'pihole',
    name: 'Home Net',
    tagline: 'DNS, DHCP, and a Pi under the desk',
    year: 2026,
    domain: 'systems',
    status: 'prototype',
    weight: 1.0,
    summary:
      'A Raspberry Pi running Pi-hole as the network’s DNS sinkhole and DHCP server. What started as ad blocking turned into the thing I learned networking on — leases, upstream resolvers, split-horizon DNS, and what happens to a household when the DNS box goes down.',
    features: [
      'Pi-hole as a network-wide DNS sinkhole',
      'Static leases so every device on the network is known',
      'The thing I actually learned networking on',
    ],
    stack: ['Raspberry Pi', 'Linux', 'Networking', 'DNS', 'Docker', 'Shell', 'Automation'],
  },
]

/** Lookup used by the terminal, palette, and deep links. */
export const projectById = new Map(projects.map((p) => [p.id, p]))
