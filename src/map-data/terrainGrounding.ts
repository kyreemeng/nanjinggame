import type { DemGridMeta } from './types'
import {
  groundSurfaceY,
  PLAYER_BODY_CLEARANCE,
  VEHICLE_BODY_CLEARANCE,
} from './groundHeight'

/** Runtime floor epsilon (feet / chassis must stay above DEM). */
export const RUNTIME_FLOOR_EPSILON = 0.12

export function minPlayerBodyY(dem: DemGridMeta, worldX: number, worldZ: number): number {
  return groundSurfaceY(dem, worldX, worldZ) + PLAYER_BODY_CLEARANCE + RUNTIME_FLOOR_EPSILON
}

export function minVehicleBodyY(dem: DemGridMeta, worldX: number, worldZ: number): number {
  return groundSurfaceY(dem, worldX, worldZ) + VEHICLE_BODY_CLEARANCE + RUNTIME_FLOOR_EPSILON
}

export function clampPlayerBodyY(
  dem: DemGridMeta,
  x: number,
  y: number,
  z: number,
): { y: number; clamped: boolean } {
  const minY = minPlayerBodyY(dem, x, z)
  if (y < minY) return { y: minY, clamped: true }
  return { y, clamped: false }
}

export function clampVehicleBodyY(
  dem: DemGridMeta,
  x: number,
  y: number,
  z: number,
): { y: number; clamped: boolean } {
  const minY = minVehicleBodyY(dem, x, z)
  if (y < minY) return { y: minY, clamped: true }
  return { y, clamped: false }
}
