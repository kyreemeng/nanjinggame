import { BLOCK_SIZE, GRID_COLS, GRID_ROWS, ROAD_WIDTH, WORLD_HALF, WORLD_SIZE } from '../constants'
import { getZone, type ZoneType } from './districtMap'
import { blockCenter, gridOffsetX, gridOffsetZ } from './RoadNetwork'
import { getRoadGraph } from './roadGraph'

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
  const pad = ROAD_WIDTH / 2 + 2
  const padSize = BLOCK_SIZE - pad * 2
  const rects: MapZoneRect[] = []
  for (let gz = 0; gz < GRID_ROWS; gz++) {
    for (let gx = 0; gx < GRID_COLS; gx++) {
      const { x, z } = blockCenter(gx, gz)
      rects.push({
        x: x - padSize / 2,
        z: z - padSize / 2,
        w: padSize,
        h: padSize,
        zone: getZone(gx, gz),
      })
    }
  }
  return rects
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
      major: a.gx === 3 || b.gx === 3 || a.gz === 3 || b.gz === 3,
    })
  }
  return segments
}

export function worldToMapPx(x: number, z: number, size: number): { px: number; py: number } {
  return {
    px: ((x + WORLD_HALF) / WORLD_SIZE) * size,
    py: ((z + WORLD_HALF) / WORLD_SIZE) * size,
  }
}

export function mapLegend(): { zone: ZoneType }[] {
  return [
    { zone: 'downtown' },
    { zone: 'residential' },
    { zone: 'industrial' },
    { zone: 'waterfront' },
    { zone: 'park' },
  ]
}

export { gridOffsetX, gridOffsetZ, WORLD_HALF, WORLD_SIZE }
