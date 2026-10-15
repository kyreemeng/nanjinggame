import { worldToGeo } from '../../../map-data/coordinate-system'
import { sampleTerrainHeight } from '../../../map-data/terrain'
import type { NanjingMapBundle } from '../../../map-data/types'
import type { WorldBounds } from '../../../map-data/coordinate-system'
import type { ColliderBox } from '../../physics/PhysicsWorld'
import * as THREE from 'three'

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

  // Rapier stores samples column-major: index = col * (nrows + 1) + row (x along col, z along row).
  for (let row = 0; row <= nrows; row++) {
    for (let col = 0; col <= ncols; col++) {
      const wx = minX + (col / ncols) * sizeX
      const wz = minZ + (row / nrows) * sizeZ
      heights[col * (nrows + 1) + row] = heightAt(bundle, wx, wz)
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

/** Invisible DEM-stamped boxes — backup if heightfield misses (APPROXIMATE flat cells). */
export function buildTerrainBoxColliders(
  bundle: NanjingMapBundle,
  bounds: WorldBounds,
  cells = 28,
): ColliderBox[] {
  const sizeX = bounds.width + 80
  const sizeZ = bounds.depth + 80
  const minX = bounds.centerX - sizeX / 2
  const minZ = bounds.centerZ - sizeZ / 2
  const cellW = sizeX / cells
  const cellD = sizeZ / cells
  const boxes: ColliderBox[] = []
  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      const cx = minX + (col + 0.5) * cellW
      const cz = minZ + (row + 0.5) * cellD
      const ground = heightAt(bundle, cx, cz)
      boxes.push({
        center: new THREE.Vector3(cx, ground + 0.22, cz),
        halfExtents: new THREE.Vector3(cellW / 2, 0.22, cellD / 2),
      })
    }
  }
  return boxes
}
