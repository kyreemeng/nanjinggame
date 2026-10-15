import * as THREE from 'three'
import { WORLD_SIZE } from './constants'
import { Player } from './entities/Player'
import { Vehicle } from './entities/Vehicle'
import { FollowCamera } from './camera/FollowCamera'
import { InputManager } from './input/InputManager'
import { PhysicsWorld } from './physics/PhysicsWorld'
import { buildCity } from './world/CityBuilder'
import { createAtmosphere, updateSunShadowFocus, type AtmosphereHandles } from './world/atmosphere'
import { DayNightCycle } from './world/dayNight'
import { useGameStore } from './store/gameStore'
import { loadSettings } from '../storage/settings'
import { VEHICLE_ENTER_DISTANCE } from './constants'
import { createPedestrianSystemStub } from './ai/pedestrianTypes'
import { createTrafficSystemStub } from './ai/trafficTypes'
import { WantedSystem } from './systems/WantedSystem'

export type ControlMode = 'foot' | 'vehicle'

export class GameEngine {
  private renderer!: THREE.WebGLRenderer
  private scene!: THREE.Scene
  private physics!: PhysicsWorld
  private input = new InputManager()
  private followCam = new FollowCamera()
  private player!: Player
  private vehicle!: Vehicle
  private mode: ControlMode = 'foot'
  private running = false
  private raf = 0
  private detachInput: (() => void) | null = null
  private interactCooldown = 0
  private fpsFrames = 0
  private fpsLast = performance.now()
  private settings = loadSettings()
  private atmosphere!: AtmosphereHandles
  private dayNight = new DayNightCycle()
  private traffic = createTrafficSystemStub()
  private pedestrians = createPedestrianSystemStub()
  private wanted = new WantedSystem()

  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  async start(): Promise<void> {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false)

    this.scene = new THREE.Scene()
    this.atmosphere = createAtmosphere(this.scene)
    this.scene.add(this.atmosphere.sun.target)

    this.physics = new PhysicsWorld()
    await this.physics.init()
    this.physics.addGround(WORLD_SIZE)

    const city = buildCity()
    this.scene.add(city.group)
    for (const box of city.colliders) {
      this.physics.addStaticBox(box)
    }

    this.player = new Player(this.physics, city.spawnPlayer)
    this.vehicle = new Vehicle(this.physics, city.spawnVehicle)
    this.scene.add(this.player.mesh, this.vehicle.mesh)

    this.followCam.resize(this.canvas.clientWidth, this.canvas.clientHeight)
    this.scene.add(this.followCam.camera)

    this.detachInput = this.input.attach(this.canvas)
    this.running = true
    this.loop()
  }

  pause(): void {
    this.input.setEnabled(false)
    this.input.exitPointerLock()
    this.input.releaseAll()
  }

  resume(): void {
    this.input.setEnabled(true)
    this.input.requestPointerLock(this.canvas)
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.raf)
    this.detachInput?.()
    this.physics.dispose()
    this.renderer.dispose()
  }

  private loop = (): void => {
    if (!this.running) return
    this.raf = requestAnimationFrame(this.loop)
    const dt = Math.min(1 / 30, 0.05)

    const store = useGameStore.getState()
    if (store.phase === 'playing') {
      this.handleInteract(dt)
      const { dx, dy } = this.input.consumeMouseDelta()
      if (this.mode === 'foot') {
        this.followCam.addMouseLook(dx, dy, this.settings.mouseSensitivity, this.settings.invertY)
        const camYaw = this.followCam.getYaw()
        this.player.update(dt, this.input, camYaw)
      } else {
        this.followCam.addMouseLook(dx, dy, this.settings.mouseSensitivity * 0.65, this.settings.invertY)
        this.vehicle.update(dt, this.input)
      }
      this.vehicle.syncMesh()

      this.physics.step(dt)

      const target =
        this.mode === 'foot'
          ? this.player.position.clone().add(new THREE.Vector3(0, 0.2, 0))
          : this.vehicle.position.clone().add(new THREE.Vector3(0, 0.5, 0))
      this.followCam.update(target, this.mode === 'vehicle', dt, this.vehicle.yaw)

      const playerPos = this.mode === 'foot' ? this.player.position : this.vehicle.position
      const distToCar = playerPos.distanceTo(this.vehicle.position)
      store.setHud({
        speedKmh: this.mode === 'vehicle' ? this.vehicle.speedKmh : 0,
        compassDeg: ((this.followCam.getYaw() * 180) / Math.PI + 360) % 360,
        playerX: playerPos.x,
        playerZ: playerPos.z,
        driving: this.mode === 'vehicle',
        canEnterVehicle: this.mode === 'foot' && distToCar < VEHICLE_ENTER_DISTANCE,
      })

      updateSunShadowFocus(this.atmosphere.sun, playerPos)
      this.dayNight.update(dt, this.atmosphere, this.scene)
      this.traffic.tick(dt)
      this.pedestrians.tick(dt)
      this.wanted.decay(dt)
    }

    this.updateFps()
    this.renderer.render(this.scene, this.followCam.camera)
  }

  private handleInteract(dt: number): void {
    this.interactCooldown = Math.max(0, this.interactCooldown - dt)
    if (this.interactCooldown > 0) return
    if (!this.input.wasPressed('KeyE')) return

    if (this.mode === 'foot') {
      const dist = this.player.position.distanceTo(this.vehicle.position)
      if (dist < VEHICLE_ENTER_DISTANCE) {
        this.mode = 'vehicle'
        this.player.setVisible(false)
        this.player.collider.setEnabled(false)
        this.interactCooldown = 0.35
        useGameStore.getState().setHud({ driving: true })
      }
    } else {
      const exit = this.vehicle.getExitPosition()
      this.player.setPosition(exit)
      this.player.setVisible(true)
      this.player.collider.setEnabled(true)
      this.mode = 'foot'
      this.vehicle.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      this.interactCooldown = 0.35
      useGameStore.getState().setHud({ driving: false, speedKmh: 0 })
    }
  }

  private updateFps(): void {
    this.fpsFrames++
    const now = performance.now()
    if (now - this.fpsLast >= 500) {
      const fps = Math.round((this.fpsFrames * 1000) / (now - this.fpsLast))
      useGameStore.getState().setHud({ fps })
      this.fpsFrames = 0
      this.fpsLast = now
    }
  }

  onResize(): void {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    this.renderer.setSize(w, h, false)
    this.followCam.resize(w, h)
  }
}
