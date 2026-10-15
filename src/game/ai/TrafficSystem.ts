import * as THREE from 'three'
import {
  getRoadGraph,
  positionOnEdge,
  yawOnEdge,
  type RoadEdge,
  type RoadGraph,
} from '../world/roadGraph'

const MAX_CARS = 18
const SPAWN_RADIUS = 95
const DESPAWN_RADIUS = 130
const BASE_SPEED_MIN = 7
const BASE_SPEED_MAX = 10

interface TrafficCar {
  mesh: THREE.Group
  edge: RoadEdge
  t: number
  dir: 1 | -1
  speed: number
  wait: number
}

function createCarMesh(color: string): THREE.Group {
  const g = new THREE.Group()
  const paint = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.35 })
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 3.2), paint)
  body.position.y = 0.4
  body.castShadow = true
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.42, 1.6),
    new THREE.MeshStandardMaterial({ color: '#1a2028', roughness: 0.3, metalness: 0.5 }),
  )
  cabin.position.set(0, 0.82, -0.1)
  cabin.castShadow = true
  g.add(body, cabin)
  return g
}

const CAR_COLORS = ['#3a6ea8', '#4a8a5a', '#c9a227', '#7a7d84', '#9e4b3c', '#5c4f7a']

export class TrafficSystem {
  private readonly graph: RoadGraph = getRoadGraph()
  private readonly cars: TrafficCar[] = []
  private readonly scene: THREE.Scene
  private spawnCooldown = 0

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  tick(dt: number, playerPos: THREE.Vector3): void {
    this.spawnCooldown -= dt
    if (this.cars.length < MAX_CARS && this.spawnCooldown <= 0) {
      this.trySpawn(playerPos)
      this.spawnCooldown = 0.45
    }

    for (let i = this.cars.length - 1; i >= 0; i--) {
      const car = this.cars[i]
      const pos = positionOnEdge(this.graph, car.edge, car.t)
      if (pos.distanceTo(playerPos) > DESPAWN_RADIUS) {
        this.scene.remove(car.mesh)
        this.cars.splice(i, 1)
        continue
      }

      let speed = car.speed
      if (car.wait > 0) {
        car.wait -= dt
        speed = 0
      } else if (car.t > 0.82 || car.t < 0.18) {
        speed *= 0.35
        if (car.t > 0.92 || car.t < 0.08) {
          car.wait = 0.4 + Math.random() * 0.5
        }
      }

      const nextT = car.t + (speed * dt) / car.edge.length * car.dir
      if (nextT >= 1 || nextT <= 0) {
        const nodeId = nextT >= 1 ? car.edge.to : car.edge.from
        const nextEdge = this.pickNextEdge(nodeId, car.edge.id)
        car.edge = nextEdge
        car.t = nextT >= 1 ? 0.05 : 0.95
        car.dir = nextEdge.from === nodeId ? 1 : -1
        car.wait = 0.25
      } else {
        car.t = nextT
      }

      const p = positionOnEdge(this.graph, car.edge, car.t)
      const yaw = yawOnEdge(this.graph, car.edge)
      car.mesh.position.copy(p)
      car.mesh.rotation.y = car.dir === 1 ? yaw : yaw + Math.PI

      for (let j = 0; j < this.cars.length; j++) {
        if (i === j) continue
        const other = positionOnEdge(this.graph, this.cars[j].edge, this.cars[j].t)
        if (p.distanceTo(other) < 4.5) {
          car.wait = Math.max(car.wait, 0.35)
        }
      }
    }
  }

  getCarPositions(): THREE.Vector3[] {
    return this.cars.map((c) => positionOnEdge(this.graph, c.edge, c.t))
  }

  private trySpawn(playerPos: THREE.Vector3): void {
    const candidates = this.graph.edges.filter((edge) => {
      const mid = positionOnEdge(this.graph, edge, 0.5)
      const d = mid.distanceTo(playerPos)
      return d > 25 && d < SPAWN_RADIUS
    })
    if (candidates.length === 0) return
    const edge = candidates[Math.floor(Math.random() * candidates.length)]
    const mesh = createCarMesh(CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)])
    const t = 0.15 + Math.random() * 0.7
    const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1
    const p = positionOnEdge(this.graph, edge, t)
    mesh.position.copy(p)
    this.scene.add(mesh)
    this.cars.push({
      mesh,
      edge,
      t,
      dir,
      speed: BASE_SPEED_MIN + Math.random() * (BASE_SPEED_MAX - BASE_SPEED_MIN + 3),
      wait: 0,
    })
  }

  private pickNextEdge(nodeId: number, exceptEdgeId: number): RoadEdge {
    const options = this.graph.edges.filter(
      (e) => (e.from === nodeId || e.to === nodeId) && e.id !== exceptEdgeId,
    )
    if (options.length === 0) {
      return this.graph.edges.find((e) => e.from === nodeId || e.to === nodeId)!
    }
    return options[Math.floor(Math.random() * options.length)]
  }

  dispose(): void {
    for (const car of this.cars) {
      this.scene.remove(car.mesh)
    }
    this.cars.length = 0
  }
}
