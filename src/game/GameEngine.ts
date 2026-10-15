import * as THREE from 'three'
import { Player } from './entities/Player'
import { Vehicle } from './entities/Vehicle'
import { FollowCamera } from './camera/FollowCamera'
import { InputManager } from './input/InputManager'
import { PhysicsWorld } from './physics/PhysicsWorld'
import { loadPlayableWorld } from './world/loadPlayableWorld'
import { resolveWorldMode } from './world/worldMode'
import { createAtmosphere, updateSunShadowFocus, type AtmosphereHandles } from './world/atmosphere'
import { DayNightCycle } from './world/dayNight'
import { useGameStore } from './store/gameStore'
import { loadSettings, type GraphicsPreset } from '../storage/settings'
import { defaultWorldPose, loadSave, type WorldPose } from '../storage/saveGame'
import { VEHICLE_ENTER_DISTANCE } from './constants'
import { TrafficSystem } from './ai/TrafficSystem'
import { PedestrianSystem } from './ai/PedestrianSystem'
import { PoliceSystem } from './ai/PoliceSystem'
import { WantedSystem } from './systems/WantedSystem'
import { MissionManager } from './missions/MissionManager'
import { applyGraphicsPreset } from './graphics/applyGraphicsPreset'
import { getAudioManager } from './audio/AudioManager'
import { t } from '../i18n'
import {
  CAMERA_MIN_ABOVE_GROUND,
  clampBodyAboveGround,
  groundSurfaceY,
  PLAYER_BODY_CLEARANCE,
  VEHICLE_BODY_CLEARANCE,
} from '../map-data/groundHeight'
import { getCachedNanjingMap } from '../map-data/loadNanjingMap'
import type { DemGridMeta } from '../map-data/types'

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
  private traffic!: TrafficSystem
  private pedestrians!: PedestrianSystem
  private wanted = new WantedSystem()
  private police!: PoliceSystem
  private missions!: MissionManager
  private audio = getAudioManager()
  private lastPlayerPos = new THREE.Vector3()
  private movedThisFrame = 0
  private lookThisFrame = 0
  private talkedThisFrame = false
  private missionSaveTimer = 0
  private worldPoseTimer = 0
  private settingsRevision = 0
  private terrainDem: DemGridMeta | null = null

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

    const worldMode = resolveWorldMode()
    const city = await loadPlayableWorld(worldMode)
    if (city.terrainHeightfield) {
      this.physics.addTerrainHeightfield(city.terrainHeightfield)
      const bundle = getCachedNanjingMap()
      this.terrainDem = bundle?.manifest.dem ?? null
    } else {
      this.physics.addGroundExtent(city.ground.centerX, city.ground.centerZ, city.ground.width, city.ground.depth)
      this.terrainDem = null
    }
    this.scene.add(city.group)
    for (const box of city.colliders) {
      this.physics.addStaticBox(box)
    }

    useGameStore.getState().setMapAnchors(city.mapAnchors)

    this.player = new Player(this.physics, city.spawnPlayer)
    this.vehicle = new Vehicle(this.physics, city.spawnVehicle)
    this.vehicle.setWorldPose(
      city.spawnVehicle.x,
      city.spawnVehicle.y,
      city.spawnVehicle.z,
      city.spawnVehicleYaw,
    )
    this.scene.add(this.player.mesh, this.vehicle.mesh)

    this.traffic = new TrafficSystem(this.scene)
    this.pedestrians = new PedestrianSystem(this.scene)
    this.police = new PoliceSystem(this.scene)
    this.missions = new MissionManager(this.scene)
    this.syncSettings()
    applyGraphicsPreset(
      {
        renderer: this.renderer,
        scene: this.scene,
        atmosphere: this.atmosphere,
        camera: this.followCam.camera,
      },
      this.settings.graphics,
    )

    const store = useGameStore.getState()
    this.missions.loadFromSave(store.missionSave, store.newGameSession)

    this.followCam.resize(this.canvas.clientWidth, this.canvas.clientHeight)
    this.scene.add(this.followCam.camera)

    this.lastPlayerPos.copy(this.player.position)
    this.applyWorldFromStore(store.newGameSession)
    this.pedestrians.ensureTutorialGuide(
      this.player.position.clone().add(new THREE.Vector3(2.5, 0, 1.5)),
    )

    this.detachInput = this.input.attach(this.canvas)
    this.running = true
    this.loop()
  }

  pause(): void {
    this.input.setEnabled(false)
    this.input.exitPointerLock()
    this.input.releaseAll()
    const slice = this.missions.getSaveSlice()
    useGameStore.getState().setMissionSave(slice)
    useGameStore.getState().setWorldPose(this.captureWorldPose())
  }

  resume(): void {
    if (useGameStore.getState().mapOpen) {
      this.input.setEnabled(false)
      return
    }
    this.input.setEnabled(true)
    this.input.requestPointerLock(this.canvas)
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.raf)
    this.detachInput?.()
    this.traffic.dispose()
    this.pedestrians.dispose()
    this.police.dispose()
    this.audio.dispose()
    this.physics.dispose()
    this.renderer.dispose()
  }

  applyGraphics(graphics: GraphicsPreset): void {
    this.settings.graphics = graphics
    applyGraphicsPreset(
      {
        renderer: this.renderer,
        scene: this.scene,
        atmosphere: this.atmosphere,
        camera: this.followCam.camera,
      },
      graphics,
    )
  }

  syncSettings(): void {
    this.settings = loadSettings()
    this.input.setBindings(this.settings.bindings)
  }

  notifySettingsChanged(): void {
    this.settingsRevision++
    this.syncSettings()
  }

  notifyLocaleChanged(): void {
    this.missions.relocalize()
  }

  private applyWorldFromStore(isNewGame: boolean): void {
    if (isNewGame) {
      this.mode = 'foot'
      this.player.setVisible(true)
      this.player.collider.setEnabled(true)
      useGameStore.getState().setHud({ driving: false })
      useGameStore.getState().setWorldPose(this.captureWorldPose())
      return
    }

    const pose: WorldPose = useGameStore.getState().worldPose ?? defaultWorldPose()
    const disk = loadSave()
    let world = disk?.world ?? pose
    if (this.terrainDem) {
      world = {
        ...world,
        player: {
          ...world.player,
          y: clampBodyAboveGround(
            this.terrainDem,
            world.player.x,
            world.player.y,
            world.player.z,
            PLAYER_BODY_CLEARANCE,
          ),
        },
        vehicle: {
          ...world.vehicle,
          y: clampBodyAboveGround(
            this.terrainDem,
            world.vehicle.x,
            world.vehicle.y,
            world.vehicle.z,
            VEHICLE_BODY_CLEARANCE,
          ),
        },
      }
    }

    this.player.setPosition(new THREE.Vector3(world.player.x, world.player.y, world.player.z))
    this.vehicle.setWorldPose(world.vehicle.x, world.vehicle.y, world.vehicle.z, world.vehicle.yaw)
    this.mode = world.mode
    if (world.mode === 'vehicle') {
      this.player.setVisible(false)
      this.player.collider.setEnabled(false)
      useGameStore.getState().setHud({ driving: true })
    } else {
      this.player.setVisible(true)
      this.player.collider.setEnabled(true)
      useGameStore.getState().setHud({ driving: false })
    }
  }

  private captureWorldPose(): WorldPose {
    const pp = this.player.position
    return {
      player: { x: pp.x, y: pp.y, z: pp.z },
      vehicle: {
        x: this.vehicle.position.x,
        y: this.vehicle.position.y,
        z: this.vehicle.position.z,
        yaw: this.vehicle.yaw,
      },
      mode: this.mode,
    }
  }

  private loop = (): void => {
    if (!this.running) return
    this.raf = requestAnimationFrame(this.loop)
    const dt = Math.min(1 / 30, 0.05)

    const store = useGameStore.getState()
    if (store.phase === 'playing') {
      const mapOpen = store.mapOpen
      if (mapOpen) {
        this.input.setEnabled(false)
      } else {
        this.input.setEnabled(true)
      }

      this.movedThisFrame = 0
      this.lookThisFrame = 0
      this.talkedThisFrame = false

      if (!mapOpen) {
        this.handleInteract(dt)
        const { dx, dy } = this.input.consumeMouseDelta()
        this.lookThisFrame = Math.abs(dx) + Math.abs(dy)
        if (this.mode === 'foot') {
          this.followCam.addMouseLook(dx, dy, this.settings.mouseSensitivity, this.settings.invertY)
          const camYaw = this.followCam.getYaw()
          this.player.update(dt, this.input, camYaw)
        } else {
          this.followCam.addMouseLook(
            dx,
            dy,
            this.settings.mouseSensitivity * 0.65,
            this.settings.invertY,
          )
          this.vehicle.update(dt, this.input)
        }
        this.vehicle.syncMesh()
        this.physics.step(dt)
      }

      const target =
        this.mode === 'foot'
          ? this.player.position.clone().add(new THREE.Vector3(0, 0.2, 0))
          : this.vehicle.position.clone().add(new THREE.Vector3(0, 0.5, 0))
      const minCameraY =
        this.terrainDem !== null
          ? groundSurfaceY(this.terrainDem, target.x, target.z) + CAMERA_MIN_ABOVE_GROUND
          : undefined
      this.followCam.update(
        target,
        this.mode === 'vehicle',
        dt,
        this.mode === 'vehicle' ? this.vehicle.yaw : undefined,
        minCameraY,
      )

      const playerPos = this.mode === 'foot' ? this.player.position : this.vehicle.position
      if (!mapOpen) {
        this.movedThisFrame = playerPos.distanceTo(this.lastPlayerPos)
        this.lastPlayerPos.copy(playerPos)
      }

      const distToCar = playerPos.distanceTo(this.vehicle.position)
      const speedKmh = this.mode === 'vehicle' ? this.vehicle.speedKmh : 0

      store.setHud({
        speedKmh,
        compassDeg: ((this.followCam.getYaw() * 180) / Math.PI + 360) % 360,
        playerX: playerPos.x,
        playerZ: playerPos.z,
        driving: this.mode === 'vehicle',
        canEnterVehicle: this.mode === 'foot' && distToCar < VEHICLE_ENTER_DISTANCE,
        npcPrompt: this.pedestrians.getNearestGreet(playerPos),
        wantedStars: this.wanted.getState().tier,
      })

      if (!mapOpen) {
        this.traffic.tick(dt, playerPos)
        this.pedestrians.tick(dt, playerPos)
      }
      this.police.tick(dt, playerPos, this.wanted.getState().tier)

      if (this.mode === 'vehicle' && speedKmh > 10) {
        for (const carPos of this.traffic.getCarPositions()) {
          if (playerPos.distanceTo(carPos) < 2.4) {
            this.wanted.addHeat(26)
            break
          }
        }
      }
      this.wanted.decay(dt)

      this.missions.update(dt, {
        movedDistance: this.movedThisFrame,
        lookAmount: this.lookThisFrame,
        enteredVehicle: false,
        talkedToPed: this.talkedThisFrame,
        driving: this.mode === 'vehicle',
        playerPos,
        speedKmh,
      })

      this.missionSaveTimer += dt
      if (this.missionSaveTimer >= 0.5) {
        this.missionSaveTimer = 0
        useGameStore.getState().setMissionSave(this.missions.getSaveSlice())
      }

      this.worldPoseTimer += dt
      if (this.worldPoseTimer >= 2) {
        this.worldPoseTimer = 0
        useGameStore.getState().setWorldPose(this.captureWorldPose())
      }

      this.audio.updateEngine(this.mode === 'vehicle', speedKmh)

      updateSunShadowFocus(this.atmosphere.sun, playerPos)
      this.dayNight.update(dt, this.atmosphere, this.scene)
    }

    this.updateFps()
    this.renderer.render(this.scene, this.followCam.camera)
  }

  private handleInteract(dt: number): void {
    this.interactCooldown = Math.max(0, this.interactCooldown - dt)
    if (this.interactCooldown > 0) return
    if (!this.input.wasPressed('interact')) return

    if (this.mode === 'foot') {
      const dist = this.player.position.distanceTo(this.vehicle.position)
      if (dist < VEHICLE_ENTER_DISTANCE) {
        this.mode = 'vehicle'
        this.player.setVisible(false)
        this.player.collider.setEnabled(false)
        this.interactCooldown = 0.35
        useGameStore.getState().setHud({ driving: true })
        return
      }
      if (this.pedestrians.tryInteract(this.player.position)) {
        this.talkedThisFrame = true
        this.interactCooldown = 0.35
        useGameStore.getState().setHud({ missionToast: t('npc.chatToast') })
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
