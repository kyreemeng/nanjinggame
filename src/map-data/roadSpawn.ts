import { geoToWorld } from './coordinate-system'
import { nearestDrivableRoadPoint } from './drivableRoads'
import {
  playerBodyYOnGround,
  vehicleBodyYOnGround,
} from './groundHeight'
import { landmarkWorldPosition } from './landmarks'
import type { DemGridMeta, NanjingMapBundle, RoadPolyline } from './types'

export interface SpawnPositions {
  player: { x: number; y: number; z: number }
  vehicle: { x: number; y: number; z: number; yaw: number }
  /** meters from requested anchor to snapped road */
  roadSnapDistance: number
  roadName?: string
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
      y: playerBodyYOnGround(dem, playerX, playerZ),
      z: playerZ,
    },
    vehicle: {
      x: vehicleX,
      y: vehicleBodyYOnGround(dem, vehicleX, vehicleZ),
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
    player: { x: anchor.x, y: playerBodyYOnGround(dem, anchor.x, anchor.z), z: anchor.z },
    vehicle: {
      x: anchor.x + 12,
      y: vehicleBodyYOnGround(dem, anchor.x + 12, anchor.z - 10),
      z: anchor.z - 10,
      yaw: 0,
    },
    roadSnapDistance: -1,
  }
}

export function computeSpawnFromBundle(bundle: NanjingMapBundle): SpawnPositions {
  return computeSpawnOnRoad(bundle.roads, bundle.manifest.dem)
}
