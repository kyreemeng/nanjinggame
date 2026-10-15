/**
 * Node-only: verify default spawn Y is on DEM surface (no TS import graph).
 */
import { readFileSync } from 'node:fs'

const ORIGIN = { lat: 32.048, lon: 118.8 }
const DEG_TO_M_LAT = 111_320
const DEG_TO_M_LON = DEG_TO_M_LAT * Math.cos((ORIGIN.lat * Math.PI) / 180)
const PLAYER_CLEARANCE = 1.05
const VEHICLE_CLEARANCE = 0.72
const SPAWN_MARGIN = 0.35

function worldToGeo(x, z) {
  return {
    lat: ORIGIN.lat + z / DEG_TO_M_LAT,
    lon: ORIGIN.lon + x / DEG_TO_M_LON,
  }
}

function geoToWorld(lat, lon) {
  return {
    x: (lon - ORIGIN.lon) * DEG_TO_M_LON,
    z: (lat - ORIGIN.lat) * DEG_TO_M_LAT,
  }
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

const NON_DRIVABLE = new Set([
  'footway',
  'path',
  'steps',
  'cycleway',
  'pedestrian',
  'corridor',
  'bridleway',
  'track',
  'proposed',
  'construction',
])

function nearestRoad(roads, x, z, maxDist = 200) {
  let best = null
  for (const road of roads) {
    if (NON_DRIVABLE.has(road.highway)) continue
    for (let i = 0; i < road.points.length - 1; i++) {
      const a = road.points[i]
      const b = road.points[i + 1]
      const abx = b.x - a.x
      const abz = b.z - a.z
      const len2 = abx * abx + abz * abz
      if (len2 < 4) continue
      const t = Math.max(0, Math.min(1, ((x - a.x) * abx + (z - a.z) * abz) / len2))
      const px = a.x + abx * t
      const pz = a.z + abz * t
      const dist = Math.hypot(px - x, pz - z)
      if (dist > maxDist) continue
      const len = Math.sqrt(len2)
      if (!best || dist < best.dist) {
        best = { px, pz, dist, dirX: abx / len, dirZ: abz / len }
      }
    }
  }
  return best
}

function computeSpawn(bundle) {
  const dem = bundle.manifest.dem
  const anchor = geoToWorld(32.041544, 118.783041)
  const hit = nearestRoad(bundle.roads, anchor.x, anchor.z)
  if (!hit) {
    return {
      player: {
        x: anchor.x,
        y: groundY(dem, anchor.x, anchor.z) + PLAYER_CLEARANCE + SPAWN_MARGIN,
        z: anchor.z,
      },
      vehicle: {
        x: anchor.x + 12,
        y: groundY(dem, anchor.x + 12, anchor.z - 10) + VEHICLE_CLEARANCE + SPAWN_MARGIN,
        z: anchor.z - 10,
      },
    }
  }
  const perpX = -hit.dirZ
  const perpZ = hit.dirX
  const playerX = hit.px + perpX * 1.8
  const playerZ = hit.pz + perpZ * 1.8
  const vehicleX = hit.px - hit.dirX * 10
  const vehicleZ = hit.pz - hit.dirZ * 10
  return {
    player: {
      x: playerX,
      y: groundY(dem, playerX, playerZ) + PLAYER_CLEARANCE + SPAWN_MARGIN,
      z: playerZ,
    },
    vehicle: {
      x: vehicleX,
      y: groundY(dem, vehicleX, vehicleZ) + VEHICLE_CLEARANCE + SPAWN_MARGIN,
      z: vehicleZ,
    },
  }
}

const bundle = JSON.parse(readFileSync('public/map-data/nanjing-core/core.bundle.json', 'utf8'))
const spawn = computeSpawn(bundle)
const dem = bundle.manifest.dem

const pg = groundY(dem, spawn.player.x, spawn.player.z)
if (spawn.player.y < pg + PLAYER_CLEARANCE + SPAWN_MARGIN - 0.05) {
  throw new Error(`player spawn below terrain: y=${spawn.player.y} ground=${pg}`)
}

const vg = groundY(dem, spawn.vehicle.x, spawn.vehicle.z)
if (spawn.vehicle.y < vg + VEHICLE_CLEARANCE + SPAWN_MARGIN - 0.05) {
  throw new Error(`vehicle spawn below terrain: y=${spawn.vehicle.y} ground=${vg}`)
}

console.log('spawn-ground-check: ok')
