import * as THREE from 'three'

export class InstancedLayer {
  readonly mesh: THREE.InstancedMesh
  private index = 0
  private readonly dummy = new THREE.Object3D()

  constructor(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    maxInstances: number,
    castShadow = false,
  ) {
    this.mesh = new THREE.InstancedMesh(geometry, material, maxInstances)
    this.mesh.castShadow = castShadow
    this.mesh.receiveShadow = false
    this.mesh.frustumCulled = true
  }

  place(
    x: number,
    y: number,
    z: number,
    rotY = 0,
    scaleX = 1,
    scaleY = 1,
    scaleZ = 1,
  ): void {
    this.dummy.position.set(x, y, z)
    this.dummy.rotation.set(0, rotY, 0)
    this.dummy.scale.set(scaleX, scaleY, scaleZ)
    this.dummy.updateMatrix()
    this.mesh.setMatrixAt(this.index, this.dummy.matrix)
    this.index++
  }

  finalize(): void {
    this.mesh.count = this.index
    this.mesh.instanceMatrix.needsUpdate = true
  }
}
