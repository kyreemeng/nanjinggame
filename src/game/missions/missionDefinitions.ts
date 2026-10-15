import { blockCenter } from '../world/RoadNetwork'

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

export const LANDMARKS: Record<string, { x: number; z: number }> = {
  spire: blockCenter(3, 5),
  pier: blockCenter(1, 0),
  yards: blockCenter(6, 2),
  grove: blockCenter(1, 1),
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
    destination: { ...blockCenter(3, 5), landmarkId: 'spire' },
  },
  {
    id: 'rush-delivery',
    kind: 'timed-drive',
    reward: 220,
    timeLimitSec: 75,
    destination: { ...blockCenter(1, 0), landmarkId: 'pier' },
  },
  {
    id: 'landmark-tour',
    kind: 'landmarks',
    reward: 260,
    landmarkIds: ['spire', 'pier', 'yards', 'grove'],
  },
]

export function missionById(id: string): MissionDef | undefined {
  return MISSIONS.find((m) => m.id === id)
}
