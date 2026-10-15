import { worldToGeo } from './coordinate-system'
import { sampleTerrainHeight } from './terrain'
import type { DemGridMeta } from './types'

/** Capsule center offset so feet sit on ground (matches Player mesh sync). */
export const PLAYER_BODY_CLEARANCE = 1.05
export const VEHICLE_BODY_CLEARANCE = 0.72
/** Extra lift so capsule feet clear DEM bilinear error vs mesh. */
export const SPAWN_SURFACE_MARGIN = 0.35
export const CAMERA_MIN_ABOVE_GROUND = 1.5

export function groundSurfaceY(dem: DemGridMeta, worldX: number, worldZ: number): number {
  const { lat, lon } = worldToGeo(worldX, worldZ)
  return sampleTerrainHeight(dem, lat, lon)
}

export function playerBodyYOnGround(dem: DemGridMeta, worldX: number, worldZ: number): number {
  return groundSurfaceY(dem, worldX, worldZ) + PLAYER_BODY_CLEARANCE + SPAWN_SURFACE_MARGIN
}

export function vehicleBodyYOnGround(dem: DemGridMeta, worldX: number, worldZ: number): number {
  return groundSurfaceY(dem, worldX, worldZ) + VEHICLE_BODY_CLEARANCE + SPAWN_SURFACE_MARGIN
}

export function clampBodyAboveGround(
  dem: DemGridMeta,
  x: number,
  y: number,
  z: number,
  clearance: number,
): number {
  return Math.max(y, groundSurfaceY(dem, x, z) + clearance)
}
