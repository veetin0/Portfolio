'use client'

import { sectorById } from '@/data/sectors'
import { Surface } from '@/components/canvas/Surface'
import { WorldSlot } from '@/components/canvas/WorldSlot'
import { PointerLight } from '@/components/canvas/PointerLight'
import { IndexSector } from '@/components/sectors/IndexSector'
import { StackSector } from '@/components/sectors/StackSector'
import { SignalSector } from '@/components/sectors/SignalSector'
import { WorkConstellation, WorkLegend } from '@/components/sectors/WorkSector'
import { SectorRail } from '@/components/hud/SectorRail'
import { Minimap } from '@/components/hud/Minimap'
import { DriftHint, IdentityMark } from '@/components/hud/Hud'

const index = sectorById.get('index')!
const work = sectorById.get('work')!
const stack = sectorById.get('stack')!
const signal = sectorById.get('signal')!

/**
 * The full experience: one world, four sectors, a camera.
 *
 * Sector content is positioned in world coordinates from data/sectors.ts.
 * The constellation is placed by lib/graph.ts around the work sector's
 * origin, so moving a sector moves its nodes with it.
 */
export function CanvasLayout() {
  return (
    <>
      <PointerLight />

      <Surface>
        <WorldSlot x={index.at.x} y={index.at.y}>
          <IndexSector />
        </WorldSlot>

        <WorkConstellation />

        <WorldSlot x={stack.at.x} y={stack.at.y}>
          <StackSector />
        </WorldSlot>

        <WorldSlot x={signal.at.x} y={signal.at.y}>
          <SignalSector />
        </WorldSlot>
      </Surface>

      <IdentityMark />
      <Minimap />
      <WorkLegend />
      <SectorRail />
      <DriftHint />
    </>
  )
}
