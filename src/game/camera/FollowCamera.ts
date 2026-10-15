import * as THREE from 'three'
import {
  CAMERA_DISTANCE_FOOT,
  CAMERA_DISTANCE_VEHICLE,
  CAMERA_HEIGHT_FOOT,
  CAMERA_HEIGHT_VEHICLE,
} from '../constants'

export class FollowCamera {
  private yaw = 0
  private pitch = 0.28
  readonly camera = new THREE.PerspectiveCamera(60, 1, 0.1, 480)

  resize(width: number, height: number): void {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  addMouseLook(dx: number, dy: number, sensitivity: number, invertY: boolean): void {
    this.yaw -= dx * 0.0022 * sensitivity
    const sign = invertY ? -1 : 1
    this.pitch = THREE.MathUtils.clamp(this.pitch - dy * 0.0016 * sensitivity * sign, -0.15, 0.85)
  }

  getYaw(): number {
    return this.yaw
  }

  update(
    targetPos: THREE.Vector3,
    driving: boolean,
    dt: number,
    targetYaw?: number,
    minCameraY?: number,
  ): void {
    if (driving && targetYaw !== undefined) {
      this.yaw = THREE.MathUtils.lerp(this.yaw, targetYaw + Math.PI, 1 - Math.exp(-4 * dt))
      this.pitch = THREE.MathUtils.lerp(this.pitch, 0.22, 1 - Math.exp(-4 * dt))
    }

    const dist = driving ? CAMERA_DISTANCE_VEHICLE : CAMERA_DISTANCE_FOOT
    const height = driving ? CAMERA_HEIGHT_VEHICLE : CAMERA_HEIGHT_FOOT
    const offset = new THREE.Vector3(
      Math.sin(this.yaw) * dist,
      height + Math.sin(this.pitch) * 1.2,
      Math.cos(this.yaw) * dist,
    )
    const desired = targetPos.clone().add(offset)
    if (minCameraY !== undefined) {
      desired.y = Math.max(desired.y, minCameraY)
    }
    this.camera.position.lerp(desired, 1 - Math.exp(-10 * dt))
    if (minCameraY !== undefined && this.camera.position.y < minCameraY) {
      this.camera.position.y = minCameraY
    }
    const lookAt = targetPos.clone().add(new THREE.Vector3(0, driving ? 0.8 : 1.4, 0))
    this.camera.lookAt(lookAt)
  }
}
