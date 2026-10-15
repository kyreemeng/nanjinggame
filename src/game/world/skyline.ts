import * as THREE from 'three'
import { WORLD_HALF, WORLD_SIZE } from '../constants'

export function createDistantSkyline(): THREE.Group {
  const g = new THREE.Group()
  const matA = new THREE.MeshStandardMaterial({
    color: '#6a7a8e',
    roughness: 0.95,
    fog: true,
  })
  const matB = new THREE.MeshStandardMaterial({
    color: '#4f5d6d',
    roughness: 0.95,
    fog: true,
  })

  const radius = WORLD_HALF + 40
  const count = 48
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const w = 12 + Math.random() * 22
    const d = 10 + Math.random() * 16
    const h = 28 + Math.random() * 55
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      Math.random() > 0.5 ? matA : matB,
    )
    mesh.position.set(Math.cos(angle) * radius, h / 2 - 2, Math.sin(angle) * radius)
    mesh.rotation.y = -angle + Math.PI / 2
    mesh.castShadow = false
    mesh.receiveShadow = false
    g.add(mesh)
  }

  const filler = new THREE.Mesh(
    new THREE.BoxGeometry(WORLD_SIZE * 1.6, 40, WORLD_SIZE * 1.6),
    new THREE.MeshStandardMaterial({ color: '#7a8ea3', roughness: 1, fog: true }),
  )
  filler.position.y = 8
  g.add(filler)

  return g
}
