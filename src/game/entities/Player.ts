import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { JUMP_VELOCITY, RUN_SPEED, WALK_SPEED } from '../constants'
import type { InputManager } from '../input/InputManager'
import type { PhysicsWorld } from '../physics/PhysicsWorld'

export class Player {
  readonly mesh: THREE.Group
  readonly body: RAPIER.RigidBody
  readonly collider: RAPIER.Collider
  readonly controller: RAPIER.KinematicCharacterController
  private verticalVelocity = 0
  private grounded = false
  private yaw = 0
  visible = true

  constructor(physics: PhysicsWorld, position: THREE.Vector3) {
    const { body, collider, controller } = physics.createPlayerCapsule(position)
    this.body = body
    this.collider = collider
    this.controller = controller

    this.mesh = new THREE.Group()
    const torso = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.32, 0.75, 6, 10),
      new THREE.MeshStandardMaterial({ color: '#2f6f9f', roughness: 0.75 }),
    )
    torso.position.y = 1.05
    torso.castShadow = true
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 12),
      new THREE.MeshStandardMaterial({ color: '#e8c4a8', roughness: 0.8 }),
    )
    head.position.y = 1.65
    head.castShadow = true
    const pack = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.45, 0.2),
      new THREE.MeshStandardMaterial({ color: '#1e2228', roughness: 0.9 }),
    )
    pack.position.set(0, 1.1, -0.22)
    this.mesh.add(torso, head, pack)
  }

  get position(): THREE.Vector3 {
    const t = this.body.translation()
    return new THREE.Vector3(t.x, t.y, t.z)
  }

  get rotationYaw(): number {
    return this.yaw
  }

  setPosition(pos: THREE.Vector3): void {
    this.body.setTranslation({ x: pos.x, y: pos.y, z: pos.z }, true)
    this.mesh.position.copy(pos)
  }

  setVisible(v: boolean): void {
    this.visible = v
    this.mesh.visible = v
  }

  update(dt: number, input: InputManager, cameraYaw: number): void {
    const forward = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw))
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

    let moveX = 0
    let moveZ = 0
    if (input.isDown('KeyW')) {
      moveX += forward.x
      moveZ += forward.z
    }
    if (input.isDown('KeyS')) {
      moveX -= forward.x
      moveZ -= forward.z
    }
    if (input.isDown('KeyA')) {
      moveX -= right.x
      moveZ -= right.z
    }
    if (input.isDown('KeyD')) {
      moveX += right.x
      moveZ += right.z
    }

    const moveDir = new THREE.Vector3(moveX, 0, moveZ)
    if (moveDir.lengthSq() > 0) moveDir.normalize()

    const speed = input.isDown('ShiftLeft') || input.isDown('ShiftRight') ? RUN_SPEED : WALK_SPEED
    const desired = moveDir.multiplyScalar(speed)

    const current = this.body.linvel()
    const horizontal = new THREE.Vector3(current.x, 0, current.z)
    const blend = 1 - Math.exp(-12 * dt)
    horizontal.lerp(desired, blend)

    if (this.grounded && input.isDown('Space')) {
      this.verticalVelocity = JUMP_VELOCITY
      this.grounded = false
    }
    this.verticalVelocity += -18 * dt

    const translation = this.body.translation()
    const desiredMovement = new THREE.Vector3(
      horizontal.x * dt,
      this.verticalVelocity * dt,
      horizontal.z * dt,
    )

    this.controller.computeColliderMovement(
      this.collider,
      { x: desiredMovement.x, y: desiredMovement.y, z: desiredMovement.z },
    )
    const corrected = this.controller.computedMovement()
    const next = {
      x: translation.x + corrected.x,
      y: translation.y + corrected.y,
      z: translation.z + corrected.z,
    }
    this.body.setNextKinematicTranslation(next)
    this.grounded = this.controller.computedGrounded()

    if (this.grounded && this.verticalVelocity < 0) {
      this.verticalVelocity = 0
    }

    if (moveDir.lengthSq() > 0.01) {
      this.yaw = Math.atan2(moveDir.x, moveDir.z)
    }

    this.mesh.position.set(next.x, next.y - 0.35, next.z)
    this.mesh.rotation.y = this.yaw
  }
}
