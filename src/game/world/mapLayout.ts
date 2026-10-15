import { ACTIVE_MAP_BOUNDS } from './activeMapBounds'
import { getRoadGraph } from './roadGraph'

export type ZoneType = 'downtown' | 'residential' | 'industrial' | 'mixed' | 'waterfront' | 'park'

export interface MapZoneRect {
  x: number
  z: number
  w: number
  h: number
  zone: ZoneType
  label?: string
}

export interface MapRoadSegment {
  x1: number
  z1: number
  x2: number
  z2: number
  major: boolean
}

const ZONE_COLORS: Record<ZoneType, string> = {
  downtown: '#3a4f68',
  residential: '#4a5a48',
  industrial: '#5a5348',
  mixed: '#4a5560',
  waterfront: '#2a5f7a',
  park: '#3d7348',
}

export function getZoneColor(zone: ZoneType): string {
  return ZONE_COLORS[zone]
}

export function buildMapZones(): MapZoneRect[] {
  const b = ACTIVE_MAP_BOUNDS
  return [
    {
      x: b.minX,
      z: b.minZ,
      w: b.width,
      h: b.depth,
      zone: 'mixed',
      label: 'verified-core',
    },
  ]
}

export function buildMapRoads(): MapRoadSegment[] {
  const graph = getRoadGraph()
  const segments: MapRoadSegment[] = []
  for (const edge of graph.edges) {
    const a = graph.nodes[edge.from]
    const b = graph.nodes[edge.to]
    segments.push({
      x1: a.x,
      z1: a.z,
      x2: b.x,
      z2: b.z,
      major: edge.length > 80,
    })
  }
  return segments
}

export function worldToMapPx(x: number, z: number, size: number): { px: number; py: number } {
  const b = ACTIVE_MAP_BOUNDS
  return {
    px: ((x - b.minX) / b.width) * size,
    py: ((z - b.minZ) / b.depth) * size,
  }
}

export function mapLegend(): { zone: ZoneType }[] {
  return [{ zone: 'mixed' }]
}

export const WORLD_SIZE = Math.max(ACTIVE_MAP_BOUNDS.width, ACTIVE_MAP_BOUNDS.depth)
export const WORLD_HALF = WORLD_SIZE / 2

/** @deprecated Harbor Row grid helpers — procedural city not used as default world. */
export function gridOffsetX(): number {
  return 0
}

/** @deprecated Harbor Row grid helpers — procedural city not used as default world. */
export function gridOffsetZ(): number {
  return 0
}
