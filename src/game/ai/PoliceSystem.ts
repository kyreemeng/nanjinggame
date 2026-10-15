import * as THREE from 'three'

const MAX_UNITS = 2
const CHASE_SPEED = 16
const SPAWN_DIST = 42

interface PoliceUnit {
  mesh: THREE.Group
}

function createPoliceCar(): THREE.Group {
  const g = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.52, 3.4),
    new THREE.MeshStandardMaterial({ color: '#1a2530', roughness: 0.35, metalness: 0.4 }),
  )
  body.position.y = 0.42
  body.castShadow = true
  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(1.72, 0.08, 3.42),
    new THREE.MeshStandardMaterial({ color: '#e8ecef', roughness: 0.5 }),
  )
  stripe.position.y = 0.55
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.12, 0.35),
    new THREE.MeshStandardMaterial({ color: '#2a3340', emissive: '#4466ff', emissiveIntensity: 0.5 }),
  )
  bar.position.set(0, 0.95, 0.2)
  g.add(body, stripe, bar)
  return g
}

export class PoliceSystem {
  private readonly units: PoliceUnit[] = []
  private spawnCooldown = 0

  private readonly scene: THREE.Scene

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  tick(dt: number, playerPos: THREE.Vector3, wantedTier: number): void {
    if (wantedTier < 2) {
      this.clear()
      return
    }

    this.spawnCooldown -= dt
    while (this.units.length < MAX_UNITS && this.spawnCooldown <= 0) {
      this.spawnNear(playerPos)
      this.spawnCooldown = 2.5
    }

    for (const unit of this.units) {
      const pos = unit.mesh.position
      const dir = playerPos.clone().sub(pos)
      dir.y = 0
      const dist = dir.length()
      if (dist > 0.5) {
        dir.normalize()
        pos.add(dir.multiplyScalar(CHASE_SPEED * dt))
        unit.mesh.position.y = 0.35
        unit.mesh.rotation.y = Math.atan2(dir.x, dir.z)
      }
    }
  }

  private spawnNear(playerPos: THREE.Vector3): void {
    const angle = Math.random() * Math.PI * 2
    const mesh = createPoliceCar()
    mesh.position.set(
      playerPos.x + Math.sin(angle) * SPAWN_DIST,
      0.35,
      playerPos.z + Math.cos(angle) * SPAWN_DIST,
    )
    this.scene.add(mesh)
    this.units.push({ mesh })
  }

  private clear(): void {
    for (const u of this.units) this.scene.remove(u.mesh)
    this.units.length = 0
  }

  dispose(): void {
    this.clear()
  }
}
