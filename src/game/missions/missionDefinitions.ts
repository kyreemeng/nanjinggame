import { blockCenter } from '../world/RoadNetwork'

export type MissionKind =
  | 'tutorial'
  | 'drive-to'
  | 'timed-drive'
  | 'landmarks'

export interface MissionDef {
  id: string
  title: string
  description: string
  kind: MissionKind
  reward: number
  destination?: { x: number; z: number; label: string }
  timeLimitSec?: number
  landmarkIds?: string[]
}

export const LANDMARKS: Record<string, { x: number; z: number; label: string }> = {
  spire: { ...blockCenter(3, 5), label: 'Glass Spire Plaza' },
  pier: { ...blockCenter(1, 0), label: 'South Pier' },
  yards: { ...blockCenter(6, 2), label: 'East Freight Yards' },
  grove: { ...blockCenter(1, 1), label: 'Rowan Grove Park' },
}

export const MISSIONS: MissionDef[] = [
  {
    id: 'tutorial',
    title: 'First Steps',
    description: 'Learn to move, look, and talk to locals.',
    kind: 'tutorial',
    reward: 80,
  },
  {
    id: 'courier-run',
    title: 'Courier Run',
    description: 'Take the coupe to the Glass Spire drop-off.',
    kind: 'drive-to',
    reward: 150,
    destination: { ...blockCenter(3, 5), label: 'Glass Spire Plaza' },
  },
  {
    id: 'rush-delivery',
    title: 'Rush Delivery',
    description: 'Reach South Pier before the tide window closes.',
    kind: 'timed-drive',
    reward: 220,
    timeLimitSec: 75,
    destination: { ...blockCenter(1, 0), label: 'South Pier' },
  },
  {
    id: 'landmark-tour',
    title: 'Harbor Row Tour',
    description: 'Discover four district landmarks on foot or by car.',
    kind: 'landmarks',
    reward: 260,
    landmarkIds: ['spire', 'pier', 'yards', 'grove'],
  },
]

export function missionById(id: string): MissionDef | undefined {
  return MISSIONS.find((m) => m.id === id)
}
