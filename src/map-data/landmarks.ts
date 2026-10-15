import type { GeoPoint } from './coordinate-system'
import { geoToWorld } from './coordinate-system'

/** Named landmarks — WGS84 from OpenStreetMap / public gazetteer (see docs). */
export interface LandmarkRecord {
  id: string
  nameEn: string
  nameZh: string
  geo: GeoPoint
  /** OSM node/way reference when known */
  osmRef?: string
}

export const NANJING_LANDMARKS: LandmarkRecord[] = [
  {
    id: 'xinjiekou',
    nameEn: 'Xinjiekou',
    nameZh: '新街口',
    geo: { lat: 32.041544, lon: 118.783041 },
    osmRef: 'node:27505821',
  },
  {
    id: 'fuzimiao',
    nameEn: 'Fuzimiao (Confucius Temple)',
    nameZh: '夫子庙',
    geo: { lat: 32.021354, lon: 118.794782 },
  },
  {
    id: 'xuanwu-lake',
    nameEn: 'Xuanwu Lake shore',
    nameZh: '玄武湖岸',
    /** OSM water centroid (bundle w88806258), north shore verified core */
    geo: { lat: 32.04559, lon: 118.81369 },
  },
  {
    id: 'ming-wall-zhongshan',
    nameEn: 'Ming city wall (Zhongshan Gate)',
    nameZh: '明城墙（中山门）',
    /** APPROXIMATE: gate position; shoreline geometry from OSM water adjacency */
    geo: { lat: 32.0458, lon: 118.8142 },
  },
  {
    id: 'laomendong',
    nameEn: 'Laomendong',
    nameZh: '老门东',
    geo: { lat: 32.0118, lon: 118.7898 },
  },
  {
    id: 'qinhuai-river',
    nameEn: 'Qinhuai River (Fuzimiao)',
    nameZh: '秦淮河（夫子庙段）',
    /** OSM riverbank centroid near Fuzimiao (bundle w120889873) */
    geo: { lat: 32.02028, lon: 118.79269 },
  },
]

/** Phase 3 — not in verified-core playable slice (excluded from default anchors). */
export const PHASE3_LANDMARKS: LandmarkRecord[] = [
  {
    id: 'zijinshan-lookout',
    nameEn: 'Purple Mountain (distant)',
    nameZh: '紫金山（远景）',
    geo: { lat: 32.072, lon: 118.848 },
  },
]

export function landmarkWorldPosition(id: string): { x: number; y: number; z: number } | null {
  const lm = NANJING_LANDMARKS.find((l) => l.id === id)
  if (!lm) return null
  return geoToWorld(lm.geo.lat, lm.geo.lon, lm.geo.elevation ?? 0)
}

export function landmarkById(id: string): LandmarkRecord | undefined {
  return NANJING_LANDMARKS.find((l) => l.id === id)
}
