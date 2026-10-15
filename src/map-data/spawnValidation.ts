import {
  groundSurfaceY,
  PLAYER_BODY_CLEARANCE,
  SPAWN_SURFACE_MARGIN,
  VEHICLE_BODY_CLEARANCE,
} from './groundHeight'
import { computeSpawnFromBundle } from './roadSpawn'
import type { NanjingMapBundle } from './types'

export function validateSpawnAboveTerrain(bundle: NanjingMapBundle): void {
  const dem = bundle.manifest.dem
  const spawn = computeSpawnFromBundle(bundle)
  const playerGround = groundSurfaceY(dem, spawn.player.x, spawn.player.z)
  const vehicleGround = groundSurfaceY(dem, spawn.vehicle.x, spawn.vehicle.z)

  const minPlayerY = playerGround + PLAYER_BODY_CLEARANCE + SPAWN_SURFACE_MARGIN - 0.05
  if (spawn.player.y < minPlayerY) {
    throw new Error(
      `player spawn below terrain: y=${spawn.player.y.toFixed(2)} need>=${minPlayerY.toFixed(2)}`,
    )
  }

  const minVehicleY = vehicleGround + VEHICLE_BODY_CLEARANCE + SPAWN_SURFACE_MARGIN - 0.05
  if (spawn.vehicle.y < minVehicleY) {
    throw new Error(
      `vehicle spawn below terrain: y=${spawn.vehicle.y.toFixed(2)} need>=${minVehicleY.toFixed(2)}`,
    )
  }
}
