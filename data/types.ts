export type Domain = 'web' | 'mobile' | 'ai' | 'tools' | 'systems' | 'games'

export type Status = 'live' | 'active' | 'prototype' | 'archived'

export interface ProjectLink {
  label: string
  href: string
  /** `upstream` marks a third-party project this one builds on, not your own
   *  repo. It renders differently so the distinction is never ambiguous. */
  kind: 'github' | 'demo' | 'writeup' | 'upstream'
}

export interface ProjectDownload {
  /** Path under /public, e.g. "/downloads/command-center-source.zip". */
  href: string
  label: string
  /** Shown next to the label so nobody clicks a 40 MB file blind. */
  size: string
  /** What the visitor needs in order to actually run it. */
  requires?: string
  /** SPDX-style identifier, e.g. "MIT". Shown on the button — without it a
   *  download is "all rights reserved" by default and legally unusable, so
   *  saying so up front is the difference between a demo and something
   *  somebody can build on. */
  license?: string
  /** Anything they should know before downloading. Rendered as a notice. */
  note?: string
}

export interface ProjectMedia {
  /** Path under /public, e.g. "/shots/lyvo-map.png". Omit the array entirely
   *  and a deterministic generated preview is drawn instead. */
  src: string
  alt: string
}

export interface Project {
  /** Stable, URL-safe. Used by the terminal (`open lyvo`) and deep links. */
  id: string
  name: string
  /** One line. Shown on the node itself — keep it short. */
  tagline: string
  year: number
  domain: Domain
  status: Status

  /** 1–3 sentences. Shown at the top of the detail panel. */
  summary: string
  /** Bullets. What it actually does. */
  features: string[]
  /** Free-form tags. These drive the constellation edges and the stack filter,
   *  so spelling must match across projects. See `lib/graph.ts`. */
  stack: string[]

  links?: ProjectLink[]
  /** Files a visitor can pull down. Put them in /public/downloads. */
  downloads?: ProjectDownload[]
  media?: ProjectMedia[]

  /** Optional metrics rendered as a small readout in the panel. */
  metrics?: { label: string; value: string }[]

  /** Credit where the project builds on someone else's work. Rendered near the
   *  top of the panel, not buried at the bottom — if part of this isn't yours,
   *  that should be the first thing a reader knows. */
  attribution?: string

  /** A result someone else judged, e.g. "3rd place · Koja Hackathon 2026".
   *  Rendered as the first thing in the panel and flagged on the node, because
   *  an outcome a jury awarded carries more weight than anything you can claim
   *  about your own work. */
  award?: string

  /** Manual world-space override. Leave undefined for auto-layout. */
  position?: { x: number; y: number }
  /** Relative node weight (0.6–1.4). Bigger = more prominent. Default 1. */
  weight?: number
}
