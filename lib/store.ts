import { create } from 'zustand'
import { sectorById, type SectorId } from '@/data/sectors'
import { flyTo } from './camera'

type Overlay = 'palette' | 'terminal' | null

interface UIState {
  /** Intro finished — gates the entrance animations. */
  booted: boolean
  /** Nearest sector to the camera. Updated by Surface, drives the rail. */
  nearest: SectorId
  /** Open project detail panel. */
  openProject: string | null
  /** Skill being cross-highlighted from the STACK sector. */
  focusTag: string | null
  /** True when focusTag was clicked rather than hovered. A pinned tag survives
   *  hovering other rows and only clears on an explicit action. */
  pinned: boolean
  /** Node under the cursor, for edge highlighting. */
  hoverNode: string | null
  overlay: Overlay
  /** Counts terminal-triggered easter eggs so the HUD can react. */
  glitch: number

  boot: () => void
  setNearest: (id: SectorId) => void
  goTo: (id: SectorId) => void
  openAt: (id: string) => void
  close: () => void
  /** Transient highlight. Ignored while a tag is pinned. */
  hoverTag: (tag: string | null) => void
  /** Sticky highlight. Clicking the pinned tag again clears it. */
  pinTag: (tag: string) => void
  clearTag: () => void
  setHoverNode: (id: string | null) => void
  setOverlay: (o: Overlay) => void
  toggleOverlay: (o: Exclude<Overlay, null>) => void
  fireGlitch: () => void
}

export const useUI = create<UIState>((set, get) => ({
  booted: false,
  nearest: 'index',
  openProject: null,
  focusTag: null,
  pinned: false,
  hoverNode: null,
  overlay: null,
  glitch: 0,

  boot: () => set({ booted: true }),
  setNearest: (id) => {
    if (get().nearest !== id) set({ nearest: id })
  },

  goTo: (id) => {
    const sector = sectorById.get(id)
    if (!sector) return
    flyTo(sector.at.x, sector.at.y, sector.zoom)
    set({ overlay: null, openProject: null, nearest: id })
  },

  openAt: (id) => set({ openProject: id, overlay: null }),
  close: () => set({ openProject: null, overlay: null }),

  hoverTag: (tag) => {
    if (get().pinned) return
    set({ focusTag: tag })
  },

  pinTag: (tag) => {
    const { focusTag, pinned } = get()
    if (pinned && focusTag === tag) set({ focusTag: null, pinned: false })
    else set({ focusTag: tag, pinned: true })
  },

  clearTag: () => set({ focusTag: null, pinned: false }),

  setHoverNode: (id) => set({ hoverNode: id }),

  setOverlay: (o) => set({ overlay: o, openProject: o ? null : get().openProject }),
  toggleOverlay: (o) => set({ overlay: get().overlay === o ? null : o, openProject: null }),

  fireGlitch: () => set({ glitch: get().glitch + 1 }),
}))
