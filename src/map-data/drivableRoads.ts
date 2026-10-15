import type { RoadPolyline } from './types'

/** Highways excluded from driving / default spawn snap (OSM highway tag). */
export const NON_DRIVABLE_HIGHWAYS = new Set([
  'footway',
  'path',
  'steps',
  'cycleway',
  'pedestrian',
  'corridor',
  'bridleway',
  'track',
  'proposed',
  'construction',
])

export function isDrivableHighway(highway: string): boolean {
  return highway.length > 0 && !NON_DRIVABLE_HIGHWAYS.has(highway)
}

export function filterDrivableRoads(roads: RoadPolyline[]): RoadPolyline[] {
  return roads.filter((r) => isDrivableHighway(r.highway))
}

export interface RoadSamplePoint {
  x: number
  z: number
  /** unit tangent along road */
  dirX: number
  dirZ: number
  highway: string
  roadName?: string
  distance: number
}

/**
 * Nearest point on any drivable road segment (2D XZ).
 */
export function nearestDrivableRoadPoint(
  roads: RoadPolyline[],
  x: number,
  z: number,
  maxDistance = 180,
): RoadSamplePoint | null {
  let best: RoadSamplePoint | null = null

  for (const road of roads) {
    if (!isDrivableHighway(road.highway)) continue
    for (let i = 0; i < road.points.length - 1; i++) {
      const a = road.points[i]
      const b = road.points[i + 1]
      const abx = b.x - a.x
      const abz = b.z - a.z
      const len2 = abx * abx + abz * abz
      if (len2 < 4) continue
      const t = Math.max(0, Math.min(1, ((x - a.x) * abx + (z - a.z) * abz) / len2))
      const px = a.x + abx * t
      const pz = a.z + abz * t
      const dist = Math.hypot(px - x, pz - z)
      if (dist > maxDistance) continue
      const len = Math.sqrt(len2)
      const dirX = abx / len
      const dirZ = abz / len
      if (!best || dist < best.distance) {
        best = {
          x: px,
          z: pz,
          dirX,
          dirZ,
          highway: road.highway,
          roadName: road.name,
          distance: dist,
        }
      }
    }
  }

  return best
}
