import type { DemGridMeta } from './types'

/** Bilinear sample from bundled DEM grid (approximate; see docs). */
export function sampleTerrainHeight(dem: DemGridMeta, lat: number, lon: number): number {
  const { rows, cols, originLat, originLon, stepLat, stepLon, elevations } = dem
  const fi = (lat - originLat) / stepLat
  const fj = (lon - originLon) / stepLon
  const i0 = Math.max(0, Math.min(rows - 2, Math.floor(fi)))
  const j0 = Math.max(0, Math.min(cols - 2, Math.floor(fj)))
  const u = fi - i0
  const v = fj - j0
  const at = (i: number, j: number) => elevations[i * cols + j] ?? 12
  const h00 = at(i0, j0)
  const h10 = at(i0 + 1, j0)
  const h01 = at(i0, j0 + 1)
  const h11 = at(i0 + 1, j0 + 1)
  return (1 - u) * (1 - v) * h00 + u * (1 - v) * h10 + (1 - u) * v * h01 + u * v * h11
}

export function sampleTerrainHeightWorld(
  dem: DemGridMeta,
  worldToGeo: (x: number, z: number) => { lat: number; lon: number },
  x: number,
  z: number,
): number {
  const { lat, lon } = worldToGeo(x, z)
  return sampleTerrainHeight(dem, lat, lon)
}
