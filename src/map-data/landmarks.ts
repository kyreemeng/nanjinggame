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
  /** Simplified proxy mesh only — not photogrammetry */
  lodProxy?: boolean
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
    geo: { lat: 32.04559, lon: 118.81369 },
  },
  {
    id: 'ming-wall-zhongshan',
    nameEn: 'Ming city wall (Zhongshan Gate)',
    nameZh: '明城墙（中山门）',
    geo: { lat: 32.0458, lon: 118.8142 },
    lodProxy: true,
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
    geo: { lat: 32.02028, lon: 118.79269 },
  },
  {
    id: 'zijinshan',
    nameEn: 'Purple Mountain (Zijinshan)',
    nameZh: '紫金山',
    geo: { lat: 32.0758, lon: 118.8488 },
    osmRef: 'relation: scenic area (centroid approx.)',
    lodProxy: true,
  },
  {
    id: 'zhongshan-ling',
    nameEn: 'Sun Yat-sen Mausoleum',
    nameZh: '中山陵',
    geo: { lat: 32.067475, lon: 118.848577 },
    osmRef: 'node:27505821 area / tourism=attraction',
    lodProxy: true,
  },
  {
    id: 'ming-xiaoling',
    nameEn: 'Ming Xiaoling Mausoleum',
    nameZh: '明孝陵',
    geo: { lat: 32.054724, lon: 118.843117 },
    osmRef: 'historic=archaeological_site',
    lodProxy: true,
  },
]

export function landmarkWorldPosition(id: string): { x: number; y: number; z: number } | null {
  const lm = landmarkById(id)
  if (!lm) return null
  return geoToWorld(lm.geo.lat, lm.geo.lon, lm.geo.elevation ?? 0)
}

export function landmarkById(id: string): LandmarkRecord | undefined {
  return NANJING_LANDMARKS.find((l) => l.id === id)
}
