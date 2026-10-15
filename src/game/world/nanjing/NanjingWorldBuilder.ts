import * as THREE from 'three'
import { ACTIVE_WORLD_BBOX, worldBoundsFromBbox, worldToGeo } from '../../../map-data/coordinate-system'
import { sampleTerrainHeight } from '../../../map-data/terrain'
import type { NanjingMapBundle } from '../../../map-data/types'
import { coreAnchorMarkers } from '../../../map-data/landmarkAnchors'
import { defaultSpawnFromBundle } from '../../../map-data/worldSpawn'
import type { ColliderBox } from '../../physics/PhysicsWorld'
import { getAsphaltMaterial, getConcreteMaterial } from '../sharedMaterials'
import { buildRoadGraphFromOsM, sampleSidewalkAlongRoads } from './osmRoadGraph'
import { setActiveRoadGraph, setSidewalkLoops } from '../roadGraph'

export interface NanjingWorldResult {
  group: THREE.Group
  colliders: ColliderBox[]
  spawnPlayer: THREE.Vector3
  spawnVehicle: THREE.Vector3
  spawnVehicleYaw: number
  bounds: ReturnType<typeof worldBoundsFromBbox>
  roadSnapDistance: number
  mapAnchors: { x: number; z: number; label: string }[]
}

function heightAt(bundle: NanjingMapBundle, x: number, z: number): number {
  const { lat, lon } = worldToGeo(x, z)
  return sampleTerrainHeight(bundle.manifest.dem, lat, lon)
}

function buildTerrainMesh(bundle: NanjingMapBundle, bounds: NanjingWorldResult['bounds']): THREE.Mesh {
  const seg = 64
  const geo = new THREE.PlaneGeometry(bounds.width + 80, bounds.depth + 80, seg, seg)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const lx = pos.getX(i)
    const lz = pos.getZ(i)
    const wx = bounds.centerX + lx
    const wz = bounds.centerZ + lz
    pos.setY(i, heightAt(bundle, wx, wz))
  }
  geo.computeVertexNormals()
  const mat = new THREE.MeshStandardMaterial({ color: '#3d4a38', roughness: 0.95 })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.set(bounds.centerX, 0, bounds.centerZ)
  mesh.receiveShadow = true
  return mesh
}

function addRoadRibbon(
  parent: THREE.Group,
  points: { x: number; z: number }[],
  width: number,
  y: number,
): void {
  if (points.length < 2) return
  const asphalt = getAsphaltMaterial()
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    const dx = b.x - a.x
    const dz = b.z - a.z
    const len = Math.hypot(dx, dz)
    if (len < 1) continue
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, len), asphalt)
    mesh.rotation.x = -Math.PI / 2
    mesh.rotation.z = -Math.atan2(dz, dx)
    mesh.position.set((a.x + b.x) / 2, y + 0.04, (a.z + b.z) / 2)
    mesh.receiveShadow = true
    parent.add(mesh)
  }
}

function addWater(parent: THREE.Group, bundle: NanjingMapBundle): void {
  const mat = new THREE.MeshStandardMaterial({
    color: '#1a4a62',
    roughness: 0.25,
    metalness: 0.15,
    transparent: true,
    opacity: 0.88,
  })
  for (const poly of bundle.water) {
    const shape = new THREE.Shape()
    const y = heightAt(bundle, poly.points[0].x, poly.points[0].z) - 0.35
    shape.moveTo(poly.points[0].x, poly.points[0].z)
    for (let i = 1; i < poly.points.length; i++) {
      shape.lineTo(poly.points[i].x, poly.points[i].z)
    }
    shape.closePath()
    const geom = new THREE.ShapeGeometry(shape)
    geom.rotateX(-Math.PI / 2)
    const mesh = new THREE.Mesh(geom, mat)
    mesh.position.y = y
    parent.add(mesh)
  }
}

function addBuildings(
  parent: THREE.Group,
  colliders: ColliderBox[],
  bundle: NanjingMapBundle,
  maxCount: number,
): void {
  const concrete = getConcreteMaterial()
  const sorted = [...bundle.buildings].sort((a, b) => b.height - a.height)
  const slice = sorted.slice(0, maxCount)
  for (const b of slice) {
    const shape = new THREE.Shape()
    shape.moveTo(b.points[0].x, b.points[0].z)
    for (let i = 1; i < b.points.length; i++) shape.lineTo(b.points[i].x, b.points[i].z)
    shape.closePath()
    const geom = new THREE.ExtrudeGeometry(shape, { depth: b.height, bevelEnabled: false })
    geom.rotateX(-Math.PI / 2)
    geom.translate(0, 0, 0)
    const baseY = heightAt(bundle, b.points[0].x, b.points[0].z)
    const mesh = new THREE.Mesh(geom, concrete)
    mesh.position.y = baseY
    mesh.castShadow = true
    mesh.receiveShadow = true
    parent.add(mesh)

    let cx = 0
    let cz = 0
    for (const p of b.points) {
      cx += p.x
      cz += p.z
    }
    cx /= b.points.length
    cz /= b.points.length
    // APPROXIMATE: coarse boxes for tall buildings only — avoids blocking OSM roads.
    if (b.height >= 18) {
      colliders.push({
        center: new THREE.Vector3(cx, baseY + b.height / 2, cz),
        halfExtents: new THREE.Vector3(3, b.height / 2, 3),
      })
    }
  }
}

function addAnchorMarkers(parent: THREE.Group, bundle: NanjingMapBundle): void {
  const markers = coreAnchorMarkers(bundle)
  const mat = new THREE.MeshStandardMaterial({ color: '#ffc857', emissive: '#5a4020', roughness: 0.4 })
  for (const m of markers) {
    const y = heightAt(bundle, m.x, m.z) + 0.5
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 8, 8), mat)
    pole.position.set(m.x, y + 4, m.z)
    pole.castShadow = true
    parent.add(pole)
  }
}

/**
 * Real-data Nanjing verified core — OSM roads/buildings/water + sampled DEM terrain.
 * See docs/nanjing-map-sources.md for provenance.
 */
export function buildNanjingWorld(bundle: NanjingMapBundle): NanjingWorldResult {
  const bounds = worldBoundsFromBbox(ACTIVE_WORLD_BBOX)
  const group = new THREE.Group()
  const colliders: ColliderBox[] = []

  group.add(buildTerrainMesh(bundle, bounds))

  const graph = buildRoadGraphFromOsM(bundle.roads)
  setActiveRoadGraph(graph)
  setSidewalkLoops(sampleSidewalkAlongRoads(bundle.roads))

  const roadsGroup = new THREE.Group()
  for (const road of bundle.roads) {
    const y =
      road.points.reduce((s, p) => s + heightAt(bundle, p.x, p.z), 0) / road.points.length
    addRoadRibbon(roadsGroup, road.points, road.width, y)
  }
  group.add(roadsGroup)

  addWater(group, bundle)
  // APPROXIMATE: cap building count for Web perf; heights may be estimated per OSM tags.
  addBuildings(group, colliders, bundle, 1200)
  addAnchorMarkers(group, bundle)

  const spawn = defaultSpawnFromBundle(bundle)
  const spawnPlayer = new THREE.Vector3(spawn.player.x, spawn.player.y, spawn.player.z)
  const spawnVehicle = new THREE.Vector3(spawn.vehicle.x, spawn.vehicle.y, spawn.vehicle.z)
  const mapAnchors = coreAnchorMarkers(bundle).map((m) => ({
    x: m.x,
    z: m.z,
    label: m.label,
  }))

  return {
    group,
    colliders,
    spawnPlayer,
    spawnVehicle,
    spawnVehicleYaw: spawn.vehicle.yaw,
    bounds,
    roadSnapDistance: spawn.roadSnapDistance,
    mapAnchors,
  }
}
