import * as THREE from 'three'
import { landmarkWorldPosition } from '../../../map-data/landmarks'
import type { NanjingMapBundle } from '../../../map-data/types'
import { worldToGeo } from '../../../map-data/coordinate-system'
import { sampleTerrainHeight } from '../../../map-data/terrain'

function groundY(bundle: NanjingMapBundle, x: number, z: number): number {
  const { lat, lon } = worldToGeo(x, z)
  return sampleTerrainHeight(bundle.manifest.dem, lat, lon)
}

/**
 * APPROXIMATE iconic proxies for scenic landmarks (LOD). Not surveyed architecture.
 */
export function addLandmarkLodMeshes(parent: THREE.Group, bundle: NanjingMapBundle): void {
  const stone = new THREE.MeshStandardMaterial({ color: '#8a9098', roughness: 0.85 })
  const roof = new THREE.MeshStandardMaterial({ color: '#2a4a6a', roughness: 0.55, metalness: 0.2 })
  const forest = new THREE.MeshStandardMaterial({ color: '#2d5a38', roughness: 0.95 })

  const zhongshan = landmarkWorldPosition('zhongshan-ling')
  if (zhongshan) {
    const g = new THREE.Group()
    const baseY = groundY(bundle, zhongshan.x, zhongshan.z)
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(42, 4, 28), stone)
    plinth.position.set(zhongshan.x, baseY + 2, zhongshan.z)
    const hall = new THREE.Mesh(new THREE.BoxGeometry(36, 14, 22), stone)
    hall.position.set(zhongshan.x, baseY + 11, zhongshan.z)
    const roofMesh = new THREE.Mesh(new THREE.ConeGeometry(22, 8, 4), roof)
    roofMesh.position.set(zhongshan.x, baseY + 22, zhongshan.z)
    roofMesh.rotation.y = Math.PI / 4
    g.add(plinth, hall, roofMesh)
    g.castShadow = true
    parent.add(g)
  }

  const xiaoling = landmarkWorldPosition('ming-xiaoling')
  if (xiaoling) {
    const baseY = groundY(bundle, xiaoling.x, xiaoling.z)
    const wall = new THREE.Mesh(new THREE.TorusGeometry(18, 1.2, 8, 32), stone)
    wall.rotation.x = Math.PI / 2
    wall.position.set(xiaoling.x, baseY + 1.2, xiaoling.z)
    const gate = new THREE.Mesh(new THREE.BoxGeometry(10, 8, 6), stone)
    gate.position.set(xiaoling.x, baseY + 4, xiaoling.z + 16)
    parent.add(wall, gate)
  }

  const zijin = landmarkWorldPosition('zijinshan')
  if (zijin) {
    const baseY = groundY(bundle, zijin.x, zijin.z)
    const hill = new THREE.Mesh(new THREE.ConeGeometry(120, 90, 24), forest)
    hill.position.set(zijin.x, baseY + 35, zijin.z)
    hill.receiveShadow = true
    parent.add(hill)
  }

}
