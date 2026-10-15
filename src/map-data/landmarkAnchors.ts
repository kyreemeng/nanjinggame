import { worldToGeo } from './coordinate-system'
import { landmarkById, landmarkWorldPosition, type LandmarkRecord } from './landmarks'
import type { NanjingMapBundle, WaterPolygon } from './types'

/** HUD / map anchors (urban core + Zijin scenic landmarks). */
export const CORE_MAP_ANCHOR_IDS = [
  'xinjiekou',
  'xuanwu-lake',
  'ming-wall-zhongshan',
  'fuzimiao',
  'qinhuai-river',
  'zijinshan',
  'zhongshan-ling',
  'ming-xiaoling',
] as const

export type CoreMapAnchorId = (typeof CORE_MAP_ANCHOR_IDS)[number]

function polygonArea(points: { x: number; z: number }[]): number {
  let sum = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    sum += a.x * b.z - b.x * a.z
  }
  return Math.abs(sum) / 2
}

function polygonCentroid(points: { x: number; z: number }[]): { x: number; z: number } {
  let cx = 0
  let cz = 0
  for (const p of points) {
    cx += p.x
    cz += p.z
  }
  return { x: cx / points.length, z: cz / points.length }
}

function largestWaterNear(
  water: WaterPolygon[],
  lat: number,
  lon: number,
  radiusDeg: number,
): WaterPolygon | null {
  let best: WaterPolygon | null = null
  let bestArea = 0
  for (const poly of water) {
    const c = polygonCentroid(poly.points)
    const g = worldToGeo(c.x, c.z)
    if (Math.abs(g.lat - lat) > radiusDeg || Math.abs(g.lon - lon) > radiusDeg) continue
    const area = polygonArea(poly.points)
    if (area > bestArea) {
      bestArea = area
      best = poly
    }
  }
  return best
}

/**
 * OSM-aligned anchor positions: lake / Qinhuai from water polygons; others from landmark table.
 */
export function resolveCoreAnchorWorld(
  bundle: NanjingMapBundle | null,
  id: CoreMapAnchorId,
): { x: number; z: number } {
  if (bundle) {
    if (id === 'xuanwu-lake') {
      const poly = largestWaterNear(bundle.water, 32.05, 118.81, 0.03)
      if (poly) return polygonCentroid(poly.points)
    }
    if (id === 'qinhuai-river') {
      const poly = largestWaterNear(bundle.water, 32.021, 118.793, 0.025)
      if (poly) return polygonCentroid(poly.points)
    }
    if (id === 'ming-wall-zhongshan') {
      const poly = largestWaterNear(bundle.water, 32.045, 118.814, 0.02)
      if (poly) {
        const c = polygonCentroid(poly.points)
        return { x: c.x, z: c.z }
      }
    }
  }

  const staticPos = landmarkWorldPosition(id)
  if (!staticPos) throw new Error(`Missing anchor: ${id}`)
  return { x: staticPos.x, z: staticPos.z }
}

export function bilingualAnchorLabel(id: CoreMapAnchorId): string {
  const lm: LandmarkRecord | undefined = landmarkById(id)
  if (!lm) return id
  return `${lm.nameZh} · ${lm.nameEn}`
}

export function coreAnchorMarkers(
  bundle: NanjingMapBundle | null,
): { x: number; z: number; label: string; anchorId: CoreMapAnchorId }[] {
  return CORE_MAP_ANCHOR_IDS.map((id) => {
    const { x, z } = resolveCoreAnchorWorld(bundle, id)
    return { x, z, label: bilingualAnchorLabel(id), anchorId: id }
  })
}
