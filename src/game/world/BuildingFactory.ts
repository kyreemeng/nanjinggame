import * as THREE from 'three'
import type { ColliderBox } from '../physics/PhysicsWorld'
import type { ZoneType } from './districtMap'
import { createFacadeTexture } from './proceduralTextures'

export interface BuildingPiece {
  group: THREE.Group
  collider: ColliderBox
  height: number
}

function colliderFromSize(
  x: number,
  z: number,
  w: number,
  d: number,
  h: number,
): ColliderBox {
  return {
    center: new THREE.Vector3(x, h / 2, z),
    halfExtents: new THREE.Vector3(w / 2, h / 2, d / 2),
  }
}

function facadeMaterial(tint: string, windows: boolean, repeatW: number, repeatH: number) {
  const tex = createFacadeTexture(tint, windows)
  tex.repeat.set(repeatW, repeatH)
  return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.82, metalness: 0.06 })
}

export function createTowerBlock(w: number, d: number, rng: () => number): BuildingPiece {
  const g = new THREE.Group()
  const tiers = 2 + Math.floor(rng() * 2)
  let y = 0
  let tw = w
  let td = d
  for (let t = 0; t < tiers; t++) {
    const h = 10 + rng() * 8
    const mat = facadeMaterial('#5c6674', true, tw / 3, h / 3)
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(tw, h, td), mat)
    mesh.position.y = y + h / 2
    mesh.castShadow = true
    mesh.receiveShadow = true
    g.add(mesh)
    y += h
    tw *= 0.78
    td *= 0.78
  }
  const spire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 1.1, 4.5, 6),
    new THREE.MeshStandardMaterial({ color: '#9eb5c9', metalness: 0.4, roughness: 0.35 }),
  )
  spire.position.y = y + 2.2
  spire.castShadow = true
  g.add(spire)
  const height = y + 4
  return { group: g, collider: colliderFromSize(0, 0, w, d, height), height }
}

export function createRowhouses(w: number, d: number, rng: () => number): BuildingPiece {
  const g = new THREE.Group()
  const units = 3
  const unitW = w / units
  let maxH = 0
  for (let u = 0; u < units; u++) {
    const h = 7 + rng() * 3
    maxH = Math.max(maxH, h)
    const tint = ['#8a7d6e', '#7d8a92', '#9a8878'][u % 3]
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(unitW * 0.92, h, d * 0.92),
      facadeMaterial(tint, true, unitW / 2.5, h / 2.5),
    )
    body.position.set(-w / 2 + unitW * (u + 0.5), h / 2, 0)
    body.castShadow = true
    g.add(body)
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(unitW * 0.95, 0.25, d),
      new THREE.MeshStandardMaterial({ color: '#4a4038', roughness: 0.9 }),
    )
    roof.position.set(body.position.x, h + 0.12, 0)
    g.add(roof)
  }
  return { group: g, collider: colliderFromSize(0, 0, w, d, maxH + 0.3), height: maxH }
}

export function createWarehouse(w: number, d: number, rng: () => number): BuildingPiece {
  const g = new THREE.Group()
  const h = 7 + rng() * 3
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    facadeMaterial('#7a7468', false, w / 5, h / 4),
  )
  body.position.y = h / 2
  body.castShadow = true
  g.add(body)
  const saw = new THREE.Mesh(
    new THREE.ConeGeometry(Math.min(w, d) * 0.55, 2.5, 4),
    new THREE.MeshStandardMaterial({ color: '#5a534c', roughness: 0.95 }),
  )
  saw.position.y = h + 1.2
  saw.rotation.y = Math.PI / 4
  g.add(saw)
  const bay = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.35, h * 0.75, 0.15),
    new THREE.MeshStandardMaterial({ color: '#3d4550', roughness: 0.7 }),
  )
  bay.position.set(0, h * 0.4, d / 2 + 0.08)
  g.add(bay)
  return { group: g, collider: colliderFromSize(0, 0, w, d, h + 1.5), height: h }
}

export function createShopfront(w: number, d: number, rng: () => number): BuildingPiece {
  const g = new THREE.Group()
  const h = 9 + rng() * 4
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    facadeMaterial('#6d7885', true, w / 3, h / 3),
  )
  body.position.y = h / 2
  body.castShadow = true
  g.add(body)
  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.9, 0.12, 1.6),
    new THREE.MeshStandardMaterial({ color: '#b8423c', roughness: 0.75 }),
  )
  awning.position.set(0, 2.4, d / 2 + 0.7)
  awning.rotation.x = -0.22
  g.add(awning)
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.5, 0.6, 0.12),
    new THREE.MeshStandardMaterial({ color: '#2f3640', emissive: '#446688', emissiveIntensity: 0.35 }),
  )
  sign.position.set(0, 3.4, d / 2 + 0.1)
  g.add(sign)
  return { group: g, collider: colliderFromSize(0, 0, w, d, h), height: h }
}

export function createApartment(w: number, d: number, rng: () => number): BuildingPiece {
  const g = new THREE.Group()
  const h = 12 + rng() * 6
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    facadeMaterial('#7a8490', true, w / 2.8, h / 3),
  )
  body.position.y = h / 2
  body.castShadow = true
  g.add(body)
  for (let floor = 1; floor < 4; floor++) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.85, 0.08, 0.9),
      new THREE.MeshStandardMaterial({ color: '#3a424c', metalness: 0.35, roughness: 0.5 }),
    )
    rail.position.set(0, floor * (h / 4), d / 2 + 0.45)
    g.add(rail)
  }
  return { group: g, collider: colliderFromSize(0, 0, w, d, h), height: h }
}

export function createPierShed(w: number, d: number): BuildingPiece {
  const g = new THREE.Group()
  const h = 5.5
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color: '#6a5c4e', roughness: 0.92 }),
  )
  body.position.y = h / 2
  body.castShadow = true
  g.add(body)
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.6, 0.2, d + 0.6),
    new THREE.MeshStandardMaterial({ color: '#3e4a52', roughness: 0.85 }),
  )
  roof.position.y = h + 0.1
  g.add(roof)
  return { group: g, collider: colliderFromSize(0, 0, w, d, h), height: h }
}

export function createBuildingForZone(
  zone: ZoneType,
  w: number,
  d: number,
  rng: () => number,
): BuildingPiece {
  const roll = rng()
  switch (zone) {
    case 'downtown':
      return roll < 0.55
        ? createTowerBlock(w, d, rng)
        : roll < 0.8
          ? createApartment(w, d, rng)
          : createShopfront(w, d, rng)
    case 'industrial':
      return createWarehouse(w, d, rng)
    case 'residential':
      return roll < 0.7 ? createRowhouses(w, d, rng) : createApartment(w * 0.85, d * 0.85, rng)
    case 'mixed':
      return roll < 0.4
        ? createShopfront(w, d, rng)
        : roll < 0.75
          ? createApartment(w, d, rng)
          : createRowhouses(w, d, rng)
    case 'waterfront':
      return roll < 0.5 ? createPierShed(w, d) : createShopfront(w * 0.9, d * 0.8, rng)
    case 'park':
      return createRowhouses(w * 0.7, d * 0.7, rng)
  }
}
