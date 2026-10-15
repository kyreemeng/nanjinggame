import { geoToWorld, worldToGeo } from './coordinate-system'
import { nearestDrivableRoadPoint } from './drivableRoads'
import { landmarkWorldPosition } from './landmarks'
import { sampleTerrainHeight } from './terrain'
import type { DemGridMeta, NanjingMapBundle, RoadPolyline } from './types'

export interface SpawnPositions {
  player: { x: number; y: number; z: number }
  vehicle: { x: number; y: number; z: number; yaw: number }
  /** meters from requested anchor to snapped road */
  roadSnapDistance: number
  roadName?: string
}

function terrainY(dem: DemGridMeta, x: number, z: number, offset: number): number {
  const { lat, lon } = worldToGeo(x, z)
  return sampleTerrainHeight(dem, lat, lon) + offset
}

function spawnFromRoadSample(
  dem: DemGridMeta,
  sample: { x: number; z: number; dirX: number; dirZ: number; roadName?: string },
  snapDistance: number,
): SpawnPositions {
  const perpX = -sample.dirZ
  const perpZ = sample.dirX
  const playerX = sample.x + perpX * 1.8
  const playerZ = sample.z + perpZ * 1.8
  const vehicleX = sample.x - sample.dirX * 10
  const vehicleZ = sample.z - sample.dirZ * 10
  const yaw = Math.atan2(sample.dirX, sample.dirZ)
  return {
    player: {
      x: playerX,
      y: terrainY(dem, playerX, playerZ, 1.1),
      z: playerZ,
    },
    vehicle: {
      x: vehicleX,
      y: terrainY(dem, vehicleX, vehicleZ, 0.65),
      z: vehicleZ,
      yaw,
    },
    roadSnapDistance: snapDistance,
    roadName: sample.roadName,
  }
}

/** Default spawn: Xinjiekou anchor snapped to nearest drivable OSM road. */
export function computeSpawnOnRoad(
  roads: RoadPolyline[],
  dem: DemGridMeta,
  anchorId = 'xinjiekou',
): SpawnPositions {
  const anchor =
    landmarkWorldPosition(anchorId) ?? geoToWorld(32.041544, 118.783041, 0)
  const sample = nearestDrivableRoadPoint(roads, anchor.x, anchor.z, 200)
  if (sample) {
    return spawnFromRoadSample(dem, sample, sample.distance)
  }

  return {
    player: { x: anchor.x, y: terrainY(dem, anchor.x, anchor.z, 1.1), z: anchor.z },
    vehicle: {
      x: anchor.x + 12,
      y: terrainY(dem, anchor.x + 12, anchor.z, 0.65),
      z: anchor.z - 10,
      yaw: 0,
    },
    roadSnapDistance: -1,
  }
}

export function computeSpawnFromBundle(bundle: NanjingMapBundle): SpawnPositions {
  return computeSpawnOnRoad(bundle.roads, bundle.manifest.dem)
}
