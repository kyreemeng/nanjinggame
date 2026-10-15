import * as THREE from 'three'
import { BLOCK_SIZE, GRID_COLS, GRID_ROWS, ROAD_WIDTH, WORLD_HALF } from '../constants'
import type { ColliderBox } from '../physics/PhysicsWorld'
import { getZone } from './districtMap'
import { createBuildingForZone } from './BuildingFactory'
import {
  blockCenter,
  buildRoadSurfaces,
  gridOffsetX,
  placeIntersections,
  paintRoadMarkings,
} from './RoadNetwork'
import {
  addBench,
  addStreetLight,
  addTree,
  createStreetPropLayers,
  finalizeStreetPropMeshes,
} from './StreetProps'
import { createDistantSkyline } from './skyline'
import { createWaterfront } from './waterfront'

export interface CityBuildResult {
  group: THREE.Group
  colliders: ColliderBox[]
  spawnPlayer: THREE.Vector3
  spawnVehicle: THREE.Vector3
}

function blockRng(gx: number, gz: number): () => number {
  let seed = (gx + 1) * 2654435761 ^ (gz + 3) * 1597334677
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 0xffffffff
  }
}

function placeBlockBuildings(
  parent: THREE.Group,
  colliders: ColliderBox[],
  gx: number,
  gz: number,
): void {
  const zone = getZone(gx, gz)
  const { x, z } = blockCenter(gx, gz)
  const rng = blockRng(gx, gz)
  const pad = ROAD_WIDTH / 2 + 2.2
  const padSize = BLOCK_SIZE - pad * 2

  if (zone === 'park' && rng() > 0.25) {
    for (let t = 0; t < 4 + Math.floor(rng() * 3); t++) {
      // trees placed later on props pass
    }
    return
  }

  const placements =
    zone === 'downtown'
      ? [
          { ox: -padSize * 0.22, oz: -padSize * 0.18, w: padSize * 0.42, d: padSize * 0.48 },
          { ox: padSize * 0.2, oz: padSize * 0.15, w: padSize * 0.4, d: padSize * 0.44 },
        ]
      : zone === 'residential' && rng() > 0.45
        ? [
            { ox: -padSize * 0.2, oz: 0, w: padSize * 0.46, d: padSize * 0.55 },
            { ox: padSize * 0.22, oz: 0, w: padSize * 0.42, d: padSize * 0.5 },
          ]
        : [{ ox: 0, oz: 0, w: padSize * (0.52 + rng() * 0.2), d: padSize * (0.52 + rng() * 0.2) }]

  for (const lot of placements) {
    const piece = createBuildingForZone(zone, lot.w, lot.d, rng)
    piece.group.position.set(x + lot.ox, 0, z + lot.oz)
    parent.add(piece.group)
    colliders.push({
      center: piece.collider.center.clone().add(new THREE.Vector3(x + lot.ox, 0, z + lot.oz)),
      halfExtents: piece.collider.halfExtents.clone(),
    })
  }
}

function scatterBlockProps(
  layers: ReturnType<typeof createStreetPropLayers>,
  gx: number,
  gz: number,
): void {
  const zone = getZone(gx, gz)
  const { x, z } = blockCenter(gx, gz)
  const rng = blockRng(gx, gz)
  const padSize = BLOCK_SIZE - ROAD_WIDTH - 4

  if (zone === 'park' || zone === 'waterfront' || zone === 'residential') {
    const treeCount = zone === 'park' ? 6 : zone === 'waterfront' ? 2 : 2
    for (let t = 0; t < treeCount; t++) {
      addTree(
        layers,
        x + (rng() - 0.5) * padSize * 0.85,
        z + (rng() - 0.5) * padSize * 0.85,
        0.85 + rng() * 0.35,
      )
    }
  }

  if (rng() > 0.55 && zone !== 'industrial') {
    addBench(layers, x + padSize * 0.35, z - padSize * 0.38, rng() * Math.PI)
  }

  const half = BLOCK_SIZE / 2 - 1.5
  addStreetLight(layers, x - half, z - half)
  if (gx % 2 === 0) addStreetLight(layers, x + half, z + half)
}

function scatterRoadLights(layers: ReturnType<typeof createStreetPropLayers>): void {
  const offsetX = gridOffsetX()
  const step = BLOCK_SIZE + ROAD_WIDTH
  for (let gx = 0; gx < GRID_COLS; gx++) {
    const roadX = gx * step - offsetX
    for (let z = -WORLD_HALF + 10; z < WORLD_HALF; z += 18) {
      addStreetLight(layers, roadX + 3.2, z)
    }
  }
}

export function buildCity(): CityBuildResult {
  const group = new THREE.Group()
  const colliders: ColliderBox[] = []
  const propLayers = createStreetPropLayers()

  buildRoadSurfaces(group)
  createWaterfront(group)

  const skyline = createDistantSkyline()
  group.add(skyline)

  for (let gz = 0; gz < GRID_ROWS; gz++) {
    for (let gx = 0; gx < GRID_COLS; gx++) {
      placeBlockBuildings(group, colliders, gx, gz)
      scatterBlockProps(propLayers, gx, gz)
    }
  }

  paintRoadMarkings(propLayers)
  placeIntersections(group, propLayers)
  scatterRoadLights(propLayers)

  for (const mesh of finalizeStreetPropMeshes(propLayers)) {
    group.add(mesh)
  }

  const spawnAnchor = blockCenter(2, 2)
  const spawnPlayer = new THREE.Vector3(spawnAnchor.x - 6, 1.1, spawnAnchor.z + 4)
  const boulevard = blockCenter(3, 2)
  const spawnVehicle = new THREE.Vector3(boulevard.x + 2, 0.65, boulevard.z - 5)

  return { group, colliders, spawnPlayer, spawnVehicle }
}
