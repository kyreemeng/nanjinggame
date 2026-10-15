import { worldToGeo } from '../../../map-data/coordinate-system'
import { sampleTerrainHeight } from '../../../map-data/terrain'
import type { NanjingMapBundle } from '../../../map-data/types'
import type { WorldBounds } from '../../../map-data/coordinate-system'

export interface TerrainHeightfieldData {
  nrows: number
  ncols: number
  heights: Float32Array
  sizeX: number
  sizeZ: number
  centerX: number
  centerZ: number
}

function heightAt(bundle: NanjingMapBundle, x: number, z: number): number {
  const { lat, lon } = worldToGeo(x, z)
  return sampleTerrainHeight(bundle.manifest.dem, lat, lon)
}

/** DEM heightfield aligned with `buildTerrainMesh` footprint. */
export function buildTerrainHeightfield(
  bundle: NanjingMapBundle,
  bounds: WorldBounds,
  subdivisions = 72,
): TerrainHeightfieldData {
  const nrows = subdivisions
  const ncols = subdivisions
  const sizeX = bounds.width + 80
  const sizeZ = bounds.depth + 80
  const minX = bounds.centerX - sizeX / 2
  const minZ = bounds.centerZ - sizeZ / 2
  const heights = new Float32Array((nrows + 1) * (ncols + 1))

  for (let row = 0; row <= nrows; row++) {
    for (let col = 0; col <= ncols; col++) {
      const wx = minX + (col / ncols) * sizeX
      const wz = minZ + (row / nrows) * sizeZ
      heights[row * (ncols + 1) + col] = heightAt(bundle, wx, wz)
    }
  }

  return {
    nrows,
    ncols,
    heights,
    sizeX,
    sizeZ,
    centerX: bounds.centerX,
    centerZ: bounds.centerZ,
  }
}
