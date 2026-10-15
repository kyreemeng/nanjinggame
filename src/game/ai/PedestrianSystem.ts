import * as THREE from 'three'
import { sampleSidewalkLoops } from '../world/roadGraph'

const MAX_PEDS = 28
const SPAWN_RADIUS = 80
const DESPAWN_RADIUS = 110

interface Pedestrian {
  mesh: THREE.Group
  points: THREE.Vector3[]
  segment: number
  u: number
  speed: number
  idleLeft: number
  greetLine: string
}

function createPedMesh(shirt: string, pants: string): THREE.Group {
  const g = new THREE.Group()
  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.22, 0.55, 4, 8),
    new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.85 }),
  )
  torso.position.y = 0.95
  torso.castShadow = true
  const legs = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.55, 0.28),
    new THREE.MeshStandardMaterial({ color: pants, roughness: 0.9 }),
  )
  legs.position.y = 0.45
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 8, 8),
    new THREE.MeshStandardMaterial({ color: '#e8c4a8', roughness: 0.8 }),
  )
  head.position.y = 1.35
  g.add(torso, legs, head)
  return g
}

const SHIRTS = ['#b84a4a', '#4a7ab8', '#6a8f5c', '#c9a03a', '#7a5a9a', '#3d8c8c']
const PANTS = ['#2a2f38', '#3d4550', '#4a4038', '#1e2830']
const GREETINGS = [
  'Morning — mind the boulevard traffic.',
  'Courier lane’s busy today.',
  'Harbor Row never sleeps.',
  'Watch for trams near the pier.',
]

export class PedestrianSystem {
  private readonly peds: Pedestrian[] = []
  private readonly loops = sampleSidewalkLoops()
  private spawnCooldown = 0
  private nearestPed: Pedestrian | null = null

  private readonly scene: THREE.Scene

  private tutorialPed: Pedestrian | null = null

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /** Guaranteed NPC for tutorial contract near spawn. */
  ensureTutorialGuide(position: THREE.Vector3): void {
    if (this.tutorialPed) return
    const mesh = createPedMesh('#4a7ab8', '#2a2f38')
    mesh.position.copy(position)
    this.scene.add(mesh)
    const loop = [
      position.clone(),
      position.clone().add(new THREE.Vector3(3, 0, 0)),
      position.clone().add(new THREE.Vector3(3, 0, 3)),
      position.clone().add(new THREE.Vector3(0, 0, 3)),
    ]
    this.tutorialPed = {
      mesh,
      points: loop,
      segment: 0,
      u: 0,
      speed: 0.9,
      idleLeft: 0,
      greetLine: 'Welcome to Harbor Row — press E to chat.',
    }
    this.peds.push(this.tutorialPed)
  }

  tick(dt: number, playerPos: THREE.Vector3): void {
    this.spawnCooldown -= dt
    if (this.peds.length < MAX_PEDS && this.spawnCooldown <= 0) {
      this.trySpawn(playerPos)
      this.spawnCooldown = 0.35
    }

    this.nearestPed = null
    let nearestDist = 2.8

    for (let i = this.peds.length - 1; i >= 0; i--) {
      const ped = this.peds[i]
      const pos = ped.mesh.position
      const dist = pos.distanceTo(playerPos)

      if (dist > DESPAWN_RADIUS) {
        this.scene.remove(ped.mesh)
        this.peds.splice(i, 1)
        continue
      }

      if (dist < nearestDist) {
        nearestDist = dist
        this.nearestPed = ped
      }

      if (ped.idleLeft > 0) {
        ped.idleLeft -= dt
        continue
      }

      const a = ped.points[ped.segment]
      const b = ped.points[(ped.segment + 1) % ped.points.length]
      const segLen = a.distanceTo(b)
      ped.u += (ped.speed * dt) / segLen
      if (ped.u >= 1) {
        ped.u = 0
        ped.segment = (ped.segment + 1) % ped.points.length
        if (Math.random() < 0.08) ped.idleLeft = 1 + Math.random() * 2.5
      }
      const t = ped.u
      ped.mesh.position.set(a.x + (b.x - a.x) * t, a.y, a.z + (b.z - a.z) * t)
      ped.mesh.rotation.y = Math.atan2(b.x - a.x, b.z - a.z)
    }
  }

  getNearestGreet(playerPos: THREE.Vector3): string | null {
    if (!this.nearestPed) return null
    if (this.nearestPed.mesh.position.distanceTo(playerPos) > 2.8) return null
    return this.nearestPed.greetLine
  }

  tryInteract(playerPos: THREE.Vector3): boolean {
    if (!this.nearestPed) return false
    if (this.nearestPed.mesh.position.distanceTo(playerPos) > 2.8) return false
    this.nearestPed.idleLeft = 2
    this.nearestPed.mesh.rotation.y += Math.PI
    return true
  }

  private trySpawn(playerPos: THREE.Vector3): void {
    const loop = this.loops[Math.floor(Math.random() * this.loops.length)]
    const start = loop[Math.floor(Math.random() * loop.length)]
    if (start.distanceTo(playerPos) > SPAWN_RADIUS) return
    const mesh = createPedMesh(
      SHIRTS[Math.floor(Math.random() * SHIRTS.length)],
      PANTS[Math.floor(Math.random() * PANTS.length)],
    )
    mesh.position.copy(start)
    this.scene.add(mesh)
    this.peds.push({
      mesh,
      points: loop.map((p) => p.clone()),
      segment: 0,
      u: Math.random(),
      speed: 1.1 + Math.random() * 0.7,
      idleLeft: 0,
      greetLine: GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
    })
  }

  dispose(): void {
    for (const ped of this.peds) this.scene.remove(ped.mesh)
    this.peds.length = 0
  }
}
