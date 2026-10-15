import { geoToWorld } from './coordinate-system'
import { landmarkWorldPosition } from './landmarks'
import { sampleTerrainHeight } from './terrain'
import type { DemGridMeta } from './types'

/** Default spawn at Xinjiekou (OSM-verified landmark). */
export function defaultSpawnPositions(dem: DemGridMeta): {
  player: { x: number; y: number; z: number }
  vehicle: { x: number; y: number; z: number; yaw: number }
} {
  const base = landmarkWorldPosition('xinjiekou') ?? geoToWorld(32.041544, 118.783041, 0)
  const y = sampleTerrainHeight(dem, 32.041544, 118.783041) + 1.1
  const vy = sampleTerrainHeight(dem, 32.041544, 118.7845) + 0.65
  return {
    player: { x: base.x - 8, y, z: base.z + 6 },
    vehicle: { x: base.x + 12, y: vy, z: base.z - 10, yaw: 0 },
  }
}
