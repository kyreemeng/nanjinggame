/**
 * WGS84 → local tangent plane (ENU-style), meters.
 * +X east, +Z north, +Y up. Origin at playable bbox center (documented in manifest).
 */

export interface GeoPoint {
  lat: number
  lon: number
  /** meters above ellipsoid / DEM sample */
  elevation?: number
}

export interface PlayableBbox {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

/**
 * Phase-2 urban verified core (新街口—中山路—玄武湖—夫子庙/秦淮河).
 * Retained for docs / regression; subset of active world.
 */
export const NANJING_VERIFIED_CORE_BBOX: PlayableBbox = {
  minLat: 32.018,
  maxLat: 32.058,
  minLon: 118.768,
  maxLon: 118.818,
}

/**
 * Phase-3 Purple Mountain scenic corridor (east of core, OSM-verified extent).
 * Overlaps core on the west; no invented terrain outside fetched OSM/DEM.
 */
export const ZIJIN_VERIFIED_BBOX: PlayableBbox = {
  minLat: 32.038,
  maxLat: 32.078,
  minLon: 118.808,
  maxLon: 118.858,
}

/** Union of urban core + Zijin corridor — active fetch & render bounds. */
export const ACTIVE_WORLD_BBOX: PlayableBbox = {
  minLat: Math.min(NANJING_VERIFIED_CORE_BBOX.minLat, ZIJIN_VERIFIED_BBOX.minLat),
  maxLat: Math.max(NANJING_VERIFIED_CORE_BBOX.maxLat, ZIJIN_VERIFIED_BBOX.maxLat),
  minLon: Math.min(NANJING_VERIFIED_CORE_BBOX.minLon, ZIJIN_VERIFIED_BBOX.minLon),
  maxLon: Math.max(NANJING_VERIFIED_CORE_BBOX.maxLon, ZIJIN_VERIFIED_BBOX.maxLon),
}

/** Long-term vision outline (not necessarily fully loaded). */
export const NANJING_PLAYABLE_BBOX: PlayableBbox = {
  minLat: 32.008,
  maxLat: 32.088,
  minLon: 118.748,
  maxLon: 118.862,
}

export const CRS_ORIGIN: GeoPoint = {
  lat: 32.048,
  lon: 118.8,
  elevation: 15,
}

const DEG_TO_M_LAT = 111_320
const ORIGIN_LAT_RAD = (CRS_ORIGIN.lat * Math.PI) / 180
const DEG_TO_M_LON = DEG_TO_M_LAT * Math.cos(ORIGIN_LAT_RAD)

export interface WorldBounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  width: number
  depth: number
  centerX: number
  centerZ: number
}

export function geoToWorld(lat: number, lon: number, elevation = 0): { x: number; y: number; z: number } {
  const x = (lon - CRS_ORIGIN.lon) * DEG_TO_M_LON
  const z = (lat - CRS_ORIGIN.lat) * DEG_TO_M_LAT
  return { x, y: elevation, z }
}

export function worldToGeo(x: number, z: number): { lat: number; lon: number } {
  const lat = CRS_ORIGIN.lat + z / DEG_TO_M_LAT
  const lon = CRS_ORIGIN.lon + x / DEG_TO_M_LON
  return { lat, lon }
}

export function worldBoundsFromBbox(bbox: PlayableBbox = ACTIVE_WORLD_BBOX): WorldBounds {
  const sw = geoToWorld(bbox.minLat, bbox.minLon, 0)
  const ne = geoToWorld(bbox.maxLat, bbox.maxLon, 0)
  const minX = Math.min(sw.x, ne.x)
  const maxX = Math.max(sw.x, ne.x)
  const minZ = Math.min(sw.z, ne.z)
  const maxZ = Math.max(sw.z, ne.z)
  return {
    minX,
    maxX,
    minZ,
    maxZ,
    width: maxX - minX,
    depth: maxZ - minZ,
    centerX: (minX + maxX) / 2,
    centerZ: (minZ + maxZ) / 2,
  }
}

export function haversineMeters(a: GeoPoint, b: GeoPoint): number {
  const R = 6_371_000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lon - a.lon) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
