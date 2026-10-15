import * as THREE from 'three'
import {
  BLOCK_SIZE,
  BOULEVARD_WIDTH,
  GRID_COLS,
  GRID_ROWS,
  ROAD_WIDTH,
  WORLD_HALF,
} from '../constants'
import { isBoulevardColumn, isBoulevardRow } from './districtMap'
import type { StreetPropLayers } from './StreetProps'
import { addRoadDash, addTrafficLight } from './StreetProps'
import { getAsphaltMaterial, getConcreteMaterial, getRoadMarkingMaterial } from './sharedMaterials'

const STEP = BLOCK_SIZE + ROAD_WIDTH

export function gridOffsetX(): number {
  return ((GRID_COLS - 1) * STEP) / 2
}

export function gridOffsetZ(): number {
  return ((GRID_ROWS - 1) * STEP) / 2
}

export function blockCenter(gx: number, gz: number): { x: number; z: number } {
  return {
    x: gx * STEP - gridOffsetX() + BLOCK_SIZE / 2,
    z: gz * STEP - gridOffsetZ() + BLOCK_SIZE / 2,
  }
}

export function roadWidthForColumn(gx: number): number {
  return isBoulevardColumn(gx) ? BOULEVARD_WIDTH : ROAD_WIDTH
}

export function roadWidthForRow(gz: number): number {
  return isBoulevardRow(gz) ? BOULEVARD_WIDTH : ROAD_WIDTH
}

export function buildRoadSurfaces(parent: THREE.Group): void {
  const asphalt = getAsphaltMaterial()
  const span = GRID_COLS * BLOCK_SIZE + (GRID_COLS - 1) * ROAD_WIDTH + BOULEVARD_WIDTH

  const baseRoad = new THREE.Mesh(new THREE.PlaneGeometry(span + 40, span + 40), asphalt)
  baseRoad.rotation.x = -Math.PI / 2
  baseRoad.receiveShadow = true
  parent.add(baseRoad)

  const concrete = getConcreteMaterial()
  for (let gz = 0; gz < GRID_ROWS; gz++) {
    for (let gx = 0; gx < GRID_COLS; gx++) {
      const { x, z } = blockCenter(gx, gz)
      const pad = ROAD_WIDTH / 2 + 2
      const padSize = BLOCK_SIZE - pad * 2
      const sw = new THREE.Mesh(new THREE.PlaneGeometry(padSize, padSize), concrete)
      sw.rotation.x = -Math.PI / 2
      sw.position.set(x, 0.025, z)
      sw.receiveShadow = true
      parent.add(sw)

      const curb = new THREE.Mesh(
        new THREE.BoxGeometry(padSize + 0.6, 0.12, padSize + 0.6),
        new THREE.MeshStandardMaterial({ color: '#6a7078', roughness: 0.95 }),
      )
      curb.position.set(x, 0.06, z)
      parent.add(curb)
    }
  }

  const boulevardMat = new THREE.MeshStandardMaterial({
    color: '#32363c',
    roughness: 0.92,
    map: asphalt.map,
  })
  const bOffset = blockCenter(3, 0).x
  const boulevard = new THREE.Mesh(
    new THREE.PlaneGeometry(BOULEVARD_WIDTH, span + 30),
    boulevardMat,
  )
  boulevard.rotation.x = -Math.PI / 2
  boulevard.position.set(bOffset, 0.018, 0)
  parent.add(boulevard)

  const eastWest = blockCenter(0, 3).z
  const crossB = new THREE.Mesh(
    new THREE.PlaneGeometry(span + 30, BOULEVARD_WIDTH),
    boulevardMat,
  )
  crossB.rotation.x = -Math.PI / 2
  crossB.position.set(0, 0.018, eastWest)
  parent.add(crossB)
}

export function addCrosswalk(
  parent: THREE.Group,
  x: number,
  z: number,
  alongX: boolean,
): void {
  const stripeMat = getRoadMarkingMaterial()
  for (let i = 0; i < 6; i++) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 2.6), stripeMat)
    stripe.rotation.x = -Math.PI / 2
    if (alongX) {
      stripe.position.set(x + (i - 2.5) * 0.82, 0.038, z)
    } else {
      stripe.rotation.z = Math.PI / 2
      stripe.position.set(x, 0.038, z + (i - 2.5) * 0.82)
    }
    parent.add(stripe)
  }
}

export function paintRoadMarkings(layers: StreetPropLayers): void {
  const offsetX = gridOffsetX()
  const offsetZ = gridOffsetZ()

  for (let gx = 0; gx < GRID_COLS; gx++) {
    const x = gx * STEP - offsetX
    const w = roadWidthForColumn(gx)
    for (let z = -WORLD_HALF + 8; z < WORLD_HALF; z += 5.5) {
      addRoadDash(layers, x, z, false)
      if (w > ROAD_WIDTH) addRoadDash(layers, x + 2.8, z, false)
    }
  }
  for (let gz = 0; gz < GRID_ROWS; gz++) {
    const z = gz * STEP - offsetZ
    const w = roadWidthForRow(gz)
    for (let x = -WORLD_HALF + 8; x < WORLD_HALF; x += 5.5) {
      addRoadDash(layers, x, z, true)
      if (w > ROAD_WIDTH) addRoadDash(layers, x, z + 2.8, true)
    }
  }
}

export function placeIntersections(parent: THREE.Group, layers: StreetPropLayers): void {
  const offsetX = gridOffsetX()
  const offsetZ = gridOffsetZ()
  for (let gx = 0; gx < GRID_COLS; gx++) {
    for (let gz = 0; gz < GRID_ROWS; gz++) {
      const x = gx * STEP - offsetX
      const z = gz * STEP - offsetZ
      addTrafficLight(layers, x + 3.8, z + 3.8, 0)
      addTrafficLight(layers, x - 3.8, z - 3.8, Math.PI)
      addCrosswalk(parent, x, z + ROAD_WIDTH * 0.45, true)
      addCrosswalk(parent, x + ROAD_WIDTH * 0.45, z, false)
    }
  }
}
