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
    geo: { lat: 32.0752, lon: 118.8124 },
  },
  {
    id: 'ming-wall-zhongshan',
    nameEn: 'Ming city wall (Zhongshan Gate)',
    nameZh: '明城墙（中山门）',
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
    geo: { lat: 32.0201, lon: 118.7935 },
  },
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
