import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import {
  VEHICLE_ACCEL,
  VEHICLE_BRAKE,
  VEHICLE_MAX_SPEED,
  VEHICLE_REVERSE_MAX,
  VEHICLE_STEER_RATE,
} from '../constants'
import type { InputManager } from '../input/InputManager'
import type { PhysicsWorld } from '../physics/PhysicsWorld'

export class Vehicle {
  readonly mesh: THREE.Group
  readonly body: RAPIER.RigidBody
  readonly collider: RAPIER.Collider
  private speed = 0
  private steerInput = 0

  constructor(physics: PhysicsWorld, position: THREE.Vector3) {
    const size = new THREE.Vector3(1.85, 0.75, 4.1)
    const { body, collider } = physics.createDynamicBox(size, position, 950)
    this.body = body
    this.collider = collider
    body.setEnabledRotations(false, true, false, true)

    this.mesh = new THREE.Group()
    const paint = new THREE.MeshStandardMaterial({
      color: '#c43c3c',
      metalness: 0.45,
      roughness: 0.35,
    })
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.55, 4.1), paint)
    chassis.position.y = 0.45
    chassis.castShadow = true
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 0.5, 2.1),
      new THREE.MeshStandardMaterial({ color: '#1a1f28', roughness: 0.25, metalness: 0.5 }),
    )
    cabin.position.set(0, 0.95, -0.15)
    cabin.castShadow = true
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 0.42, 1.9),
      new THREE.MeshStandardMaterial({
        color: '#88aacc',
        transparent: true,
        opacity: 0.45,
        metalness: 0.8,
        roughness: 0.1,
      }),
    )
    glass.position.copy(cabin.position)
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.9 })
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.28, 12)
    const wheelPositions = [
      [-0.9, 0.32, 1.35],
      [0.9, 0.32, 1.35],
      [-0.9, 0.32, -1.35],
      [0.9, 0.32, -1.35],
    ]
    for (const [wx, wy, wz] of wheelPositions) {
      const w = new THREE.Mesh(wheelGeo, wheelMat)
      w.rotation.z = Math.PI / 2
      w.position.set(wx, wy, wz)
      w.castShadow = true
      this.mesh.add(w)
    }
    const headlightMat = new THREE.MeshStandardMaterial({
      color: '#fff6dd',
      emissive: '#ffe7a0',
      emissiveIntensity: 0.8,
    })
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.08), headlightMat)
    hl.position.set(0, 0.55, 2.05)
    this.mesh.add(chassis, cabin, glass, hl)
  }

  get position(): THREE.Vector3 {
    const t = this.body.translation()
    return new THREE.Vector3(t.x, t.y, t.z)
  }

  get yaw(): number {
    const r = this.body.rotation()
    const q = new THREE.Quaternion(r.x, r.y, r.z, r.w)
    const e = new THREE.Euler().setFromQuaternion(q, 'YXZ')
    return e.y
  }

  get speedKmh(): number {
    return Math.abs(this.speed) * 3.6
  }

  syncMesh(): void {
    const t = this.body.translation()
    const r = this.body.rotation()
    this.mesh.position.set(t.x, t.y - 0.35, t.z)
    this.mesh.quaternion.set(r.x, r.y, r.z, r.w)
  }

  update(dt: number, input: InputManager): void {
    const forward = input.isAction('accelerate')
    const reverse = input.isAction('reverse')
    const brake = input.isAction('brake')
    const left = input.isAction('steerLeft')
    const right = input.isAction('steerRight')

    let accel = 0
    if (forward) accel += VEHICLE_ACCEL
    if (reverse) accel -= VEHICLE_ACCEL * 0.65
    if (brake) {
      const brakeForce = Math.sign(this.speed) * -VEHICLE_BRAKE
      accel += brakeForce
    }

    this.speed += accel * dt
    const maxFwd = VEHICLE_MAX_SPEED
    const maxRev = -VEHICLE_REVERSE_MAX
    this.speed = THREE.MathUtils.clamp(this.speed, maxRev, maxFwd)

    if (!forward && !reverse && !brake) {
      this.speed *= 1 - Math.min(1, 1.8 * dt)
      if (Math.abs(this.speed) < 0.05) this.speed = 0
    }

    this.steerInput = THREE.MathUtils.damp(this.steerInput, (right ? 1 : 0) - (left ? 1 : 0), 8, dt)

    const yaw = this.yaw
    const turnScale = THREE.MathUtils.clamp(Math.abs(this.speed) / 12, 0.15, 1)
    const newYaw = yaw - this.steerInput * VEHICLE_STEER_RATE * turnScale * dt * Math.sign(this.speed || 1)
    const halfYaw = newYaw / 2
    this.body.setRotation(
      { x: 0, y: Math.sin(halfYaw), z: 0, w: Math.cos(halfYaw) },
      true,
    )

    const dirX = Math.sin(newYaw)
    const dirZ = Math.cos(newYaw)
    const vel = this.body.linvel()
    const targetVx = dirX * this.speed
    const targetVz = dirZ * this.speed
    const blend = 1 - Math.exp(-6 * dt)
    const vx = THREE.MathUtils.lerp(vel.x, targetVx, blend)
    const vz = THREE.MathUtils.lerp(vel.z, targetVz, blend)
    this.body.setLinvel({ x: vx, y: vel.y, z: vz }, true)
  }

  getExitPosition(): THREE.Vector3 {
    const pos = this.position
    const yaw = this.yaw
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw))
    return pos.clone().add(right.multiplyScalar(2.4)).setY(1.05)
  }
}
