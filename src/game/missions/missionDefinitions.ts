import { landmarkWorldPosition } from '../../map-data/landmarks'

export type MissionKind =
  | 'tutorial'
  | 'drive-to'
  | 'timed-drive'
  | 'landmarks'

export interface MissionDef {
  id: string
  kind: MissionKind
  reward: number
  destination?: { x: number; z: number; landmarkId: string }
  timeLimitSec?: number
  landmarkIds?: string[]
}

function lm(id: string): { x: number; z: number } {
  const p = landmarkWorldPosition(id)
  if (!p) throw new Error(`Unknown landmark: ${id}`)
  return { x: p.x, z: p.z }
}

export const LANDMARKS: Record<string, { x: number; z: number }> = {
  xinjiekou: lm('xinjiekou'),
  fuzimiao: lm('fuzimiao'),
  'xuanwu-lake': lm('xuanwu-lake'),
  laomendong: lm('laomendong'),
}

export const MISSIONS: MissionDef[] = [
  {
    id: 'tutorial',
    kind: 'tutorial',
    reward: 80,
  },
  {
    id: 'courier-run',
    kind: 'drive-to',
    reward: 150,
    destination: { ...lm('fuzimiao'), landmarkId: 'fuzimiao' },
  },
  {
    id: 'rush-delivery',
    kind: 'timed-drive',
    reward: 220,
    timeLimitSec: 120,
    destination: { ...lm('xuanwu-lake'), landmarkId: 'xuanwu-lake' },
  },
  {
    id: 'landmark-tour',
    kind: 'landmarks',
    reward: 260,
    landmarkIds: ['xinjiekou', 'fuzimiao', 'xuanwu-lake', 'laomendong'],
  },
]

export function missionById(id: string): MissionDef | undefined {
  return MISSIONS.find((m) => m.id === id)
}
