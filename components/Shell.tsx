'use client'

import { useIsCanvas, useMounted } from '@/lib/hooks'
import { CanvasLayout } from '@/components/layouts/CanvasLayout'
import { StackedLayout } from '@/components/layouts/StackedLayout'
import { BootIntro } from '@/components/hud/BootIntro'
import { CommandPalette } from '@/components/hud/CommandPalette'
import { Terminal } from '@/components/hud/Terminal'
import { KeyBindings } from '@/components/hud/KeyBindings'
import { DeepLink } from '@/components/hud/DeepLink'
import { GlitchLayer } from '@/components/hud/Hud'
import { ProjectPanel } from '@/components/work/ProjectPanel'
import { StaticFallback } from '@/components/StaticFallback'

/**
 * Picks a layout and mounts the shared overlays.
 *
 * The canvas and the stacked document are genuinely different experiences,
 * so this is a hard swap rather than a responsive stylesheet — but everything
 * floating above them (panel, palette, terminal, shortcuts) is shared, which
 * is why they live here and not inside either layout.
 */
export function Shell() {
  const mounted = useMounted()
  const isCanvas = useIsCanvas()

  // Until the media query resolves we can't know which layout to build, and
  // guessing causes a flash. Render the crawlable static version instead —
  // it's what search engines and no-JS visitors get too.
  if (!mounted) return <StaticFallback />

  return (
    <>
      {isCanvas ? <CanvasLayout /> : <StackedLayout />}

      <ProjectPanel />
      <CommandPalette />
      <Terminal />

      <BootIntro />
      <KeyBindings />
      <DeepLink canvas={isCanvas} />
      <GlitchLayer />
    </>
  )
}
