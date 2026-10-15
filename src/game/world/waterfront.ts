import * as THREE from 'three'
import { blockCenter } from './RoadNetwork'

export function createWaterfront(parent: THREE.Group): void {
  const southZ = blockCenter(0, 0).z - 28

  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(520, 120),
    new THREE.MeshStandardMaterial({
      color: '#2a5f7a',
      roughness: 0.15,
      metalness: 0.35,
      transparent: true,
      opacity: 0.92,
    }),
  )
  water.rotation.x = -Math.PI / 2
  water.position.set(0, -0.08, southZ)
  parent.add(water)

  const pierMat = new THREE.MeshStandardMaterial({ color: '#5c4f42', roughness: 0.9 })
  for (let i = -2; i <= 2; i++) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 34), pierMat)
    pier.position.set(i * 22, 0.5, southZ + 38)
    pier.receiveShadow = true
    parent.add(pier)
    const deck = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.15, 32), pierMat)
    deck.position.set(pier.position.x, 1.15, pier.position.z)
    parent.add(deck)
  }

  const quay = new THREE.Mesh(
    new THREE.BoxGeometry(520, 1.4, 6),
    new THREE.MeshStandardMaterial({ color: '#6a6f78', roughness: 0.88 }),
  )
  quay.position.set(0, 0.55, blockCenter(3, 0).z - 12)
  quay.receiveShadow = true
  parent.add(quay)

  const railingMat = new THREE.MeshStandardMaterial({ color: '#3a424c', metalness: 0.4, roughness: 0.5 })
  for (let x = -120; x <= 120; x += 8) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 6), railingMat)
    post.position.set(x, 1.35, quay.position.z + 3.2)
    parent.add(post)
  }
}
