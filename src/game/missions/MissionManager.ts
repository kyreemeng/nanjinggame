import * as THREE from 'three'
import { getAudioManager } from '../audio/AudioManager'
import { useGameStore } from '../store/gameStore'
import { LANDMARKS, MISSIONS, missionById, type MissionDef } from './missionDefinitions'
import type { MissionState } from './types'

export interface MissionSaveSlice {
  completedIds: string[]
  activeId: string | null
  progress: Record<string, unknown>
}

export interface MissionSignals {
  movedDistance: number
  lookAmount: number
  enteredVehicle: boolean
  talkedToPed: boolean
  driving: boolean
  playerPos: THREE.Vector3
  speedKmh: number
}

export class MissionManager {
  private readonly markers = new THREE.Group()
  private completed = new Set<string>()
  private activeId: string | null = 'tutorial'
  private progress: Record<string, unknown> = {}
  private deadlineMs: number | null = null
  private toastTimer = 0

  constructor(scene: THREE.Scene) {
    scene.add(this.markers)
    this.syncMarkers()
    this.pushObjective()
  }

  loadFromSave(slice: MissionSaveSlice | null, isNewGame: boolean): void {
    if (isNewGame || !slice) {
      this.completed = new Set()
      this.activeId = 'tutorial'
      this.progress = { tutorial: { move: 0, look: 0, talk: false } }
      this.deadlineMs = null
    } else {
      this.completed = new Set(slice.completedIds)
      this.activeId = slice.activeId
      this.progress = slice.progress
      this.restoreDeadline()
    }
    this.syncMarkers()
    this.pushObjective()
  }

  getSaveSlice(): MissionSaveSlice {
    return {
      completedIds: [...this.completed],
      activeId: this.activeId,
      progress: this.progress,
    }
  }

  update(dt: number, signals: MissionSignals): void {
    if (this.toastTimer > 0) {
      this.toastTimer -= dt
      if (this.toastTimer <= 0) {
        useGameStore.getState().setHud({ missionToast: null })
      }
    }

    if (!this.activeId) {
      useGameStore.getState().setHud({
        objective: 'All contracts complete — free roam Harbor Row.',
        missionTimerSec: null,
      })
      return
    }

    const def = missionById(this.activeId)
    if (!def) return

    switch (def.kind) {
      case 'tutorial':
        this.updateTutorial(def, signals)
        break
      case 'drive-to':
        this.updateDriveTo(def, signals)
        break
      case 'timed-drive':
        this.updateTimedDrive(def, signals, dt)
        break
      case 'landmarks':
        this.updateLandmarks(def, signals)
        break
      default:
        break
    }

    this.syncMarkers()
    this.pushObjective()
  }

  private updateTutorial(def: MissionDef, s: MissionSignals): void {
    const p = (this.progress.tutorial as { move: number; look: number; talk: boolean }) ?? {
      move: 0,
      look: 0,
      talk: false,
    }
    p.move += s.movedDistance
    p.look += s.lookAmount
    if (s.talkedToPed) p.talk = true
    this.progress.tutorial = p

    if (p.move >= 12 && p.look >= 80 && p.talk) {
      this.complete(def)
    } else if (p.move < 12) {
      useGameStore.getState().setHud({
        objective: `${def.title}: Walk around (${Math.min(12, Math.floor(p.move))}/12 m)`,
      })
    } else if (p.look < 80) {
      useGameStore.getState().setHud({
        objective: `${def.title}: Look around with the mouse`,
      })
    } else {
      useGameStore.getState().setHud({
        objective: `${def.title}: Press E near a pedestrian to chat`,
      })
    }
  }

  private updateDriveTo(def: MissionDef, s: MissionSignals): void {
    const dest = def.destination!
    const dist = Math.hypot(s.playerPos.x - dest.x, s.playerPos.z - dest.z)
    useGameStore.getState().setHud({
      objective: `${def.title}: Drive to ${dest.label} (${Math.round(dist)} m)`,
    })
    if (s.driving && dist < 14) this.complete(def)
  }

  private updateTimedDrive(def: MissionDef, s: MissionSignals, dt: number): void {
    if (this.deadlineMs === null) {
      this.deadlineMs = performance.now() + (def.timeLimitSec ?? 60) * 1000
    }
    const left = Math.max(0, (this.deadlineMs - performance.now()) / 1000)
    useGameStore.getState().setHud({ missionTimerSec: Math.ceil(left) })
    const dest = def.destination!
    const dist = Math.hypot(s.playerPos.x - dest.x, s.playerPos.z - dest.z)
    useGameStore.getState().setHud({
      objective: `${def.title}: ${dest.label} — ${Math.round(dist)} m · ${Math.ceil(left)}s`,
    })
    if (left <= 0 && dist >= 14) {
      this.fail(def, 'Time expired — contract failed.')
      return
    }
    if (s.driving && dist < 16) this.complete(def)
    void dt
  }

  private updateLandmarks(def: MissionDef, s: MissionSignals): void {
    const found = (this.progress.found as string[]) ?? []
    for (const id of def.landmarkIds ?? []) {
      if (found.includes(id)) continue
      const lm = LANDMARKS[id]
      const d = Math.hypot(s.playerPos.x - lm.x, s.playerPos.z - lm.z)
      if (d < 18) found.push(id)
    }
    this.progress.found = found
    const need = def.landmarkIds?.length ?? 0
    useGameStore.getState().setHud({
      objective: `${def.title}: Landmarks ${found.length}/${need}`,
    })
    if (found.length >= need) this.complete(def)
  }

  private complete(def: MissionDef): void {
    this.completed.add(def.id)
    const money = useGameStore.getState().money + def.reward
    getAudioManager().playMissionComplete()
    useGameStore.getState().setHud({
      money,
      missionToast: `Contract complete: ${def.title} (+$${def.reward})`,
    })
    this.toastTimer = 5
    this.deadlineMs = null
    useGameStore.getState().setHud({ missionTimerSec: null })
    this.activeId = MISSIONS.find((m) => !this.completed.has(m.id))?.id ?? null
    if (this.activeId) {
      const next = missionById(this.activeId)!
      if (next.kind === 'timed-drive') {
        this.deadlineMs = performance.now() + (next.timeLimitSec ?? 60) * 1000
      }
      if (next.kind === 'tutorial') {
        this.progress.tutorial = { move: 0, look: 0, talk: false }
      }
      if (next.kind === 'landmarks') {
        this.progress.found = []
      }
    }
    this.syncMarkers()
  }

  private fail(def: MissionDef, message: string): void {
    useGameStore.getState().setHud({
      missionToast: message,
      missionTimerSec: null,
    })
    this.toastTimer = 4
    this.deadlineMs = performance.now() + (def.timeLimitSec ?? 60) * 1000
  }

  private restoreDeadline(): void {
    const def = this.activeId ? missionById(this.activeId) : null
    if (def?.kind === 'timed-drive') {
      const elapsed = (this.progress.timedElapsed as number) ?? 0
      this.deadlineMs = performance.now() + ((def.timeLimitSec ?? 60) - elapsed) * 1000
    }
  }

  private pushObjective(): void {
    const markers: { x: number; z: number; label?: string }[] = []
    const def = this.activeId ? missionById(this.activeId) : null
    if (!def) {
      useGameStore.getState().setHud({ mapMarkers: markers })
      return
    }
    if (def.destination) {
      markers.push({ x: def.destination.x, z: def.destination.z, label: def.destination.label })
    }
    if (def.kind === 'landmarks') {
      for (const id of def.landmarkIds ?? []) {
        const lm = LANDMARKS[id]
        const found = ((this.progress.found as string[]) ?? []).includes(id)
        if (!found) markers.push({ x: lm.x, z: lm.z, label: lm.label })
      }
    }
    useGameStore.getState().setHud({ mapMarkers: markers })
  }

  private syncMarkers(): void {
    while (this.markers.children.length > 0) {
      this.markers.remove(this.markers.children[0])
    }
    const def = this.activeId ? missionById(this.activeId) : null
    if (!def) return

    const addPin = (x: number, z: number, color: number) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.2, 1.55, 24),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
      )
      ring.rotation.x = -Math.PI / 2
      ring.position.set(x, 0.12, z)
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35 }),
      )
      pole.position.set(x, 1.6, z)
      const bob = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 10, 10),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6 }),
      )
      bob.position.set(x, 3.3, z)
      this.markers.add(ring, pole, bob)
    }

    if (def.destination) addPin(def.destination.x, def.destination.z, 0x5fd4ff)
    if (def.kind === 'landmarks') {
      for (const id of def.landmarkIds ?? []) {
        const found = ((this.progress.found as string[]) ?? []).includes(id)
        if (!found) {
          const lm = LANDMARKS[id]
          addPin(lm.x, lm.z, 0xffc857)
        }
      }
    }
  }

  getActiveState(): MissionState {
    if (!this.activeId) return 'completed'
    return 'active'
  }
}
