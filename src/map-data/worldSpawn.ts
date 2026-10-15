import type { DemGridMeta, NanjingMapBundle } from './types'
import { computeSpawnFromBundle, computeSpawnOnRoad, type SpawnPositions } from './roadSpawn'

/** Default spawn at Xinjiekou, snapped to nearest drivable OSM road. */
export function defaultSpawnPositions(dem: DemGridMeta, roads?: NanjingMapBundle['roads']): SpawnPositions {
  if (roads) return computeSpawnOnRoad(roads, dem, 'xinjiekou')
  return computeSpawnOnRoad([], dem, 'xinjiekou')
}

export function defaultSpawnFromBundle(bundle: NanjingMapBundle): SpawnPositions {
  return computeSpawnFromBundle(bundle)
}

export type { SpawnPositions } from './roadSpawn'
