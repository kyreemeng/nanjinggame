import { DEFAULT_BINDINGS, type GameAction } from '../game/input/actions'

const SETTINGS_KEY = 'ashline-settings-v2'

export type GraphicsPreset = 'low' | 'medium' | 'high'

export interface GameSettings {
  masterVolume: number
  sfxVolume: number
  musicVolume: number
  mouseSensitivity: number
  invertY: boolean
  graphics: GraphicsPreset
  bindings: Record<GameAction, string>
}

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.85,
  sfxVolume: 0.9,
  musicVolume: 0.5,
  mouseSensitivity: 1,
  invertY: false,
  graphics: 'medium',
  bindings: { ...DEFAULT_BINDINGS },
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY) ?? localStorage.getItem('ashline-settings-v1')
    if (!raw) return { ...DEFAULT_SETTINGS, bindings: { ...DEFAULT_BINDINGS } }
    const parsed = JSON.parse(raw) as Partial<GameSettings>
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      bindings: { ...DEFAULT_BINDINGS, ...parsed.bindings },
    }
  } catch {
    return { ...DEFAULT_SETTINGS, bindings: { ...DEFAULT_BINDINGS } }
  }
}

export function saveSettings(settings: GameSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
