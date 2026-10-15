import * as THREE from 'three'
import type { AtmosphereHandles } from './atmosphere'

/** Phase 2 hook — time advances only when `enabled` (off by default). */
export class DayNightCycle {
  timeOfDay = 0.38
  enabled = false
  readonly speed = 0.015

  update(dt: number, atmosphere: AtmosphereHandles, scene: THREE.Scene): void {
    if (!this.enabled) return
    this.timeOfDay = (this.timeOfDay + dt * this.speed) % 1
    const day = Math.sin(this.timeOfDay * Math.PI * 2) * 0.5 + 0.5
    atmosphere.sun.intensity = 0.35 + day * 1.25
    atmosphere.hemi.intensity = 0.25 + day * 0.45
    const fog = scene.fog
    if (fog instanceof THREE.Fog) {
      fog.near = 40 + day * 20
      fog.far = 160 + day * 60
    }
  }
}
