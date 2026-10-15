import * as THREE from 'three'
import { BLOCK_SIZE, GRID_BLOCKS, ROAD_WIDTH, WORLD_SIZE } from '../constants'
import type { ColliderBox } from '../physics/PhysicsWorld'
import {
  createAsphaltTexture,
  createConcreteTexture,
  createFacadeTexture,
} from './proceduralTextures'

export interface CityBuildResult {
  group: THREE.Group
  colliders: ColliderBox[]
  spawnPlayer: THREE.Vector3
  spawnVehicle: THREE.Vector3
}

type DistrictStyle = 'downtown' | 'residential' | 'industrial' | 'mixed'

function pickStyle(gx: number, gz: number): DistrictStyle {
  const cx = (GRID_BLOCKS - 1) / 2
  const dist = Math.hypot(gx - cx, gz - cx)
  if (dist < 0.9) return 'downtown'
  if (gx === 0 || gz === 0 || gx === GRID_BLOCKS - 1 || gz === GRID_BLOCKS - 1)
    return 'industrial'
  if (dist < 1.6) return 'mixed'
  return 'residential'
}

function createBuilding(
  style: DistrictStyle,
  footprintW: number,
  footprintD: number,
): THREE.Group {
  const g = new THREE.Group()
  let height = 8 + Math.random() * 6
  let tint = '#6f7a88'
  let roofColor = '#3d4550'
  if (style === 'downtown') {
    height = 16 + Math.random() * 18
    tint = '#5a6472'
    roofColor = '#2f3640'
  } else if (style === 'industrial') {
    height = 6 + Math.random() * 4
    tint = '#7a7568'
    roofColor = '#4a463f'
  } else if (style === 'residential') {
    height = 7 + Math.random() * 5
    tint = '#8a7d72'
    roofColor = '#5c4f47'
  }

  const facadeTex = createFacadeTexture(tint, style !== 'industrial')
  facadeTex.repeat.set(footprintW / 4, height / 4)
  const wallMat = new THREE.MeshStandardMaterial({
    map: facadeTex,
    roughness: 0.85,
    metalness: 0.05,
  })
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(footprintW, height, footprintD),
    wallMat,
  )
  body.position.y = height / 2
  body.castShadow = true
  body.receiveShadow = true
  g.add(body)

  if (style === 'downtown') {
    const crown = new THREE.Mesh(
      new THREE.BoxGeometry(footprintW * 0.65, height * 0.12, footprintD * 0.65),
      new THREE.MeshStandardMaterial({ color: '#8ea4b8', metalness: 0.35, roughness: 0.4 }),
    )
    crown.position.y = height + height * 0.06
    crown.castShadow = true
    g.add(crown)
  } else if (style === 'residential') {
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(Math.max(footprintW, footprintD) * 0.55, 2.2, 4),
      new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.9 }),
    )
    roof.position.y = height + 1.1
    roof.rotation.y = Math.PI / 4
    roof.castShadow = true
    g.add(roof)
  } else {
    const lip = new THREE.Mesh(
      new THREE.BoxGeometry(footprintW + 0.3, 0.35, footprintD + 0.3),
      new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.95 }),
    )
    lip.position.y = height + 0.18
    g.add(lip)
  }

  const ledge = new THREE.Mesh(
    new THREE.BoxGeometry(footprintW + 0.15, 0.25, footprintD + 0.15),
    new THREE.MeshStandardMaterial({ color: '#3a3f46', roughness: 0.8 }),
  )
  ledge.position.y = 1.2
  g.add(ledge)

  return g
}

function addStreetLight(parent: THREE.Group, x: number, z: number): void {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 5.2, 8),
    new THREE.MeshStandardMaterial({ color: '#2b2f36', metalness: 0.6, roughness: 0.45 }),
  )
  pole.position.set(x, 2.6, z)
  pole.castShadow = true
  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.08, 0.08),
    new THREE.MeshStandardMaterial({ color: '#2b2f36', metalness: 0.6, roughness: 0.45 }),
  )
  arm.position.set(x + 0.55, 5.1, z)
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 8, 8),
    new THREE.MeshStandardMaterial({
      color: '#fff2c9',
      emissive: '#ffdd88',
      emissiveIntensity: 1.2,
    }),
  )
  lamp.position.set(x + 1.05, 5.05, z)
  const light = new THREE.PointLight('#ffd699', 28, 22, 1.6)
  light.position.copy(lamp.position)
  parent.add(pole, arm, lamp, light)
}

function addTree(parent: THREE.Group, x: number, z: number): void {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.16, 1.4, 6),
    new THREE.MeshStandardMaterial({ color: '#5c4030', roughness: 0.95 }),
  )
  trunk.position.set(x, 0.7, z)
  trunk.castShadow = true
  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(0.9 + Math.random() * 0.4, 2.4, 7),
    new THREE.MeshStandardMaterial({ color: '#3f7a4a', roughness: 0.85 }),
  )
  foliage.position.set(x, 2.3, z)
  foliage.castShadow = true
  parent.add(trunk, foliage)
}

function addCrosswalk(parent: THREE.Group, x: number, z: number, alongX: boolean): void {
  const stripeMat = new THREE.MeshStandardMaterial({ color: '#e8ecef', roughness: 0.9 })
  for (let i = 0; i < 5; i++) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 2.4), stripeMat)
    stripe.rotation.x = -Math.PI / 2
    if (alongX) {
      stripe.position.set(x + (i - 2) * 0.85, 0.03, z)
    } else {
      stripe.rotation.z = Math.PI / 2
      stripe.position.set(x, 0.03, z + (i - 2) * 0.85)
    }
    parent.add(stripe)
  }
}

export function buildCity(): CityBuildResult {
  const group = new THREE.Group()
  const colliders: ColliderBox[] = []

  const asphalt = createAsphaltTexture()
  const concrete = createConcreteTexture()
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE),
    new THREE.MeshStandardMaterial({ map: asphalt, roughness: 0.95 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  group.add(ground)

  const sidewalkMat = new THREE.MeshStandardMaterial({ map: concrete, roughness: 0.92 })
  const offset = ((GRID_BLOCKS - 1) * (BLOCK_SIZE + ROAD_WIDTH)) / 2

  for (let gz = 0; gz < GRID_BLOCKS; gz++) {
    for (let gx = 0; gx < GRID_BLOCKS; gx++) {
      const style = pickStyle(gx, gz)
      const blockX = gx * (BLOCK_SIZE + ROAD_WIDTH) - offset + BLOCK_SIZE / 2
      const blockZ = gz * (BLOCK_SIZE + ROAD_WIDTH) - offset + BLOCK_SIZE / 2

      const pad = ROAD_WIDTH / 2 + 1.8
      const padSize = BLOCK_SIZE - pad * 2
      const sw = new THREE.Mesh(new THREE.PlaneGeometry(padSize, padSize), sidewalkMat)
      sw.rotation.x = -Math.PI / 2
      sw.position.set(blockX, 0.02, blockZ)
      sw.receiveShadow = true
      group.add(sw)

      const lotW = padSize * (0.55 + Math.random() * 0.25)
      const lotD = padSize * (0.55 + Math.random() * 0.25)
      const building = createBuilding(style, lotW, lotD)
      building.position.set(blockX, 0, blockZ)
      group.add(building)

      const bHeight =
        style === 'downtown' ? 22 : style === 'industrial' ? 8 : style === 'residential' ? 10 : 14
      colliders.push({
        center: new THREE.Vector3(blockX, bHeight / 2, blockZ),
        halfExtents: new THREE.Vector3(lotW / 2, bHeight / 2, lotD / 2),
      })

      if (Math.random() > 0.45) {
        addTree(group, blockX + padSize * 0.35, blockZ - padSize * 0.38)
      }
    }
  }

  for (let i = -GRID_BLOCKS; i <= GRID_BLOCKS; i++) {
    const roadPos = i * (BLOCK_SIZE + ROAD_WIDTH) - offset
    addCrosswalk(group, roadPos, -offset + ROAD_WIDTH * 0.5, true)
    addCrosswalk(group, -offset + ROAD_WIDTH * 0.5, roadPos, false)
    for (let t = -WORLD_SIZE / 2 + 6; t < WORLD_SIZE / 2; t += 14) {
      if (Math.abs(t - roadPos) < 3) continue
      addStreetLight(group, roadPos + (i % 2 === 0 ? 2.8 : -2.8), t)
    }
  }

  const spawnPlayer = new THREE.Vector3(-12, 1.1, 8)
  const spawnVehicle = new THREE.Vector3(-8, 0.65, 14)

  return { group, colliders, spawnPlayer, spawnVehicle }
}
