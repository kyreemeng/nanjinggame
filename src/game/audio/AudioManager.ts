import { loadSettings } from '../../storage/settings'

class AudioManager {
  private ctx: AudioContext | null = null
  private engineOsc: OscillatorNode | null = null
  private engineGain: GainNode | null = null
  private engineActive = false

  private ensureContext(): AudioContext | null {
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext()
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume()
      }
      return this.ctx
    } catch {
      return null
    }
  }

  private masterGain(): number {
    const s = loadSettings()
    return s.masterVolume * s.sfxVolume
  }

  playUiClick(): void {
    const ctx = this.ensureContext()
    if (!ctx) return
    const g = ctx.createGain()
    g.gain.value = this.masterGain() * 0.35
    const o = ctx.createOscillator()
    o.type = 'square'
    o.frequency.value = 880
    o.connect(g)
    g.connect(ctx.destination)
    const t = ctx.currentTime
    o.start(t)
    o.stop(t + 0.04)
  }

  playMissionComplete(): void {
    const ctx = this.ensureContext()
    if (!ctx) return
    const g = ctx.createGain()
    g.gain.value = this.masterGain() * 0.45
    const o = ctx.createOscillator()
    o.type = 'triangle'
    o.connect(g)
    g.connect(ctx.destination)
    const t = ctx.currentTime
    o.frequency.setValueAtTime(440, t)
    o.frequency.exponentialRampToValueAtTime(880, t + 0.18)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
    o.start(t)
    o.stop(t + 0.36)
  }

  updateEngine(driving: boolean, speedKmh: number): void {
    const ctx = this.ensureContext()
    if (!ctx) return

    if (!driving || speedKmh < 2) {
      if (this.engineOsc) {
        this.engineOsc.stop()
        this.engineOsc.disconnect()
        this.engineGain?.disconnect()
        this.engineOsc = null
        this.engineGain = null
        this.engineActive = false
      }
      return
    }

    if (!this.engineActive) {
      this.engineOsc = ctx.createOscillator()
      this.engineGain = ctx.createGain()
      this.engineOsc.type = 'sawtooth'
      this.engineOsc.connect(this.engineGain)
      this.engineGain.connect(ctx.destination)
      this.engineOsc.start()
      this.engineActive = true
    }

    const base = 55 + speedKmh * 1.8
    this.engineOsc!.frequency.setTargetAtTime(base, ctx.currentTime, 0.08)
    this.engineGain!.gain.setTargetAtTime(this.masterGain() * 0.08, ctx.currentTime, 0.1)
  }

  dispose(): void {
    if (this.engineOsc) {
      this.engineOsc.stop()
      this.engineOsc = null
    }
    this.engineGain = null
    this.engineActive = false
    void this.ctx?.close()
    this.ctx = null
  }
}

let instance: AudioManager | null = null

export function getAudioManager(): AudioManager {
  if (!instance) instance = new AudioManager()
  return instance
}
