/**
 * Rapier regression: after simulated fall/move, body Y stays >= DEM floor.
 */
import { readFileSync } from 'node:fs'
import RAPIER from '@dimforge/rapier3d-compat'

const ORIGIN = { lat: 32.048, lon: 118.8 }
const DEG_TO_M_LAT = 111_320
const DEG_TO_M_LON = DEG_TO_M_LAT * Math.cos((ORIGIN.lat * Math.PI) / 180)
const PLAYER_CLEARANCE = 1.05
const RUNTIME_EPS = 0.12

function worldToGeo(x, z) {
  return { lat: ORIGIN.lat + z / DEG_TO_M_LAT, lon: ORIGIN.lon + x / DEG_TO_M_LON }
}

function sampleTerrainHeight(dem, lat, lon) {
  const { rows, cols, originLat, originLon, stepLat, stepLon, elevations } = dem
  const fi = (lat - originLat) / stepLat
  const fj = (lon - originLon) / stepLon
  const i0 = Math.max(0, Math.min(rows - 2, Math.floor(fi)))
  const j0 = Math.max(0, Math.min(cols - 2, Math.floor(fj)))
  const u = fi - i0
  const v = fj - j0
  const at = (i, j) => elevations[i * cols + j] ?? 12
  const h00 = at(i0, j0)
  const h10 = at(i0 + 1, j0)
  const h01 = at(i0, j0 + 1)
  const h11 = at(i0 + 1, j0 + 1)
  return (1 - u) * (1 - v) * h00 + u * (1 - v) * h10 + (1 - u) * v * h01 + u * v * h11
}

function groundY(dem, x, z) {
  const { lat, lon } = worldToGeo(x, z)
  return sampleTerrainHeight(dem, lat, lon)
}

function minBodyY(dem, x, z) {
  return groundY(dem, x, z) + PLAYER_CLEARANCE + RUNTIME_EPS
}

function buildHeightfield(bundle, bounds) {
  const nrows = 48
  const ncols = 48
  const sizeX = bounds.width + 80
  const sizeZ = bounds.depth + 80
  const minX = bounds.centerX - sizeX / 2
  const minZ = bounds.centerZ - sizeZ / 2
  const heights = new Float32Array((nrows + 1) * (ncols + 1))
  for (let row = 0; row <= nrows; row++) {
    for (let col = 0; col <= ncols; col++) {
      const wx = minX + (col / ncols) * sizeX
      const wz = minZ + (row / nrows) * sizeZ
      const { lat, lon } = worldToGeo(wx, wz)
      heights[col * (nrows + 1) + row] = sampleTerrainHeight(bundle.manifest.dem, lat, lon)
    }
  }
  return { nrows, ncols, heights, sizeX, sizeZ, centerX: bounds.centerX, centerZ: bounds.centerZ }
}

function worldBoundsFromBbox(bbox) {
  const sw = {
    x: (bbox.minLon - ORIGIN.lon) * DEG_TO_M_LON,
    z: (bbox.minLat - ORIGIN.lat) * DEG_TO_M_LAT,
  }
  const ne = {
    x: (bbox.maxLon - ORIGIN.lon) * DEG_TO_M_LON,
    z: (bbox.maxLat - ORIGIN.lat) * DEG_TO_M_LAT,
  }
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

await RAPIER.init()
const bundle = JSON.parse(readFileSync('public/map-data/nanjing-core/core.bundle.json', 'utf8'))
const dem = bundle.manifest.dem
const bbox = bundle.manifest.bbox
const bounds = worldBoundsFromBbox(bbox)
const hf = buildHeightfield(bundle, bounds)

const world = new RAPIER.World({ x: 0, y: -18, z: 0 })
const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed())
const scale = { x: hf.sizeX / hf.ncols, y: 1, z: hf.sizeZ / hf.nrows }
const desc = RAPIER.ColliderDesc.heightfield(hf.nrows, hf.ncols, hf.heights, scale)
desc.setTranslation(hf.centerX - hf.sizeX / 2, 0, hf.centerZ - hf.sizeZ / 2)
world.createCollider(desc, body)

const spawnX = -1653
const spawnZ = -710
let y = minBodyY(dem, spawnX, spawnZ)
const player = world.createRigidBody(
  RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(spawnX, y, spawnZ),
)
const col = world.createCollider(RAPIER.ColliderDesc.capsule(0.7, 0.35), player)
const controller = world.createCharacterController(0.02)
controller.enableSnapToGround(0.5)

let vy = 0
const dt = 1 / 60
for (let frame = 0; frame < 180; frame++) {
  vy -= 18 * dt
  const t = player.translation()
  const desired = { x: 0.15, y: vy * dt, z: 0.08 }
  controller.computeColliderMovement(col, desired)
  const corrected = controller.computedMovement()
  let nextY = t.y + corrected.y
  const floor = minBodyY(dem, t.x + corrected.x, t.z + corrected.z)
  if (nextY < floor) {
    nextY = floor
    vy = 0
  }
  player.setNextKinematicTranslation({
    x: t.x + corrected.x,
    y: nextY,
    z: t.z + corrected.z,
  })
  world.step()
  const after = player.translation()
  const minY = minBodyY(dem, after.x, after.z)
  if (after.y < minY - 0.02) {
    throw new Error(
      `terrain-fall-sim: frame ${frame} y=${after.y.toFixed(3)} < floor ${minY.toFixed(3)}`,
    )
  }
}

console.log('terrain-fall-sim: ok (3s simulated fall/move above DEM)')
