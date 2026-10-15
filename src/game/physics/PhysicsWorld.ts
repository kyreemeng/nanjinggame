import RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'

export interface ColliderBox {
  center: THREE.Vector3
  halfExtents: THREE.Vector3
}

export class PhysicsWorld {
  world!: RAPIER.World
  private staticBodies: RAPIER.RigidBody[] = []

  async init(): Promise<void> {
    await RAPIER.init()
    this.world = new RAPIER.World({ x: 0, y: -18, z: 0 })
  }

  addStaticBox(box: ColliderBox): void {
    const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
      box.center.x,
      box.center.y,
      box.center.z,
    )
    const body = this.world.createRigidBody(bodyDesc)
    const collider = RAPIER.ColliderDesc.cuboid(
      box.halfExtents.x,
      box.halfExtents.y,
      box.halfExtents.z,
    )
    this.world.createCollider(collider, body)
    this.staticBodies.push(body)
  }

  addGround(size: number): void {
    const bodyDesc = RAPIER.RigidBodyDesc.fixed()
    const body = this.world.createRigidBody(bodyDesc)
    const collider = RAPIER.ColliderDesc.cuboid(size / 2, 0.15, size / 2).setTranslation(
      0,
      -0.15,
      0,
    )
    this.world.createCollider(collider, body)
    this.staticBodies.push(body)
  }

  createDynamicBox(
    size: THREE.Vector3,
    position: THREE.Vector3,
    mass: number,
  ): { body: RAPIER.RigidBody; collider: RAPIER.Collider } {
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(position.x, position.y, position.z)
      .setLinearDamping(0.2)
      .setAngularDamping(2.5)
    const body = this.world.createRigidBody(bodyDesc)
    const collider = RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2).setMass(
      mass,
    )
    const col = this.world.createCollider(collider, body)
    return { body, collider: col }
  }

  createPlayerCapsule(position: THREE.Vector3): {
    body: RAPIER.RigidBody
    collider: RAPIER.Collider
    controller: RAPIER.KinematicCharacterController
  } {
    const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
      position.x,
      position.y,
      position.z,
    )
    const body = this.world.createRigidBody(bodyDesc)
    const collider = RAPIER.ColliderDesc.capsule(0.7, 0.35)
    const col = this.world.createCollider(collider, body)
    const controller = this.world.createCharacterController(0.02)
    controller.setApplyImpulsesToDynamicBodies(true)
    controller.enableSnapToGround(0.35)
    controller.setMaxSlopeClimbAngle((45 * Math.PI) / 180)
    return { body, collider: col, controller }
  }

  step(dt: number): void {
    this.world.timestep = dt
    this.world.step()
  }

  dispose(): void {
    this.world.free()
  }
}
