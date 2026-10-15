const SETTINGS_KEY = 'ashline-settings-v1'

export interface GameSettings {
  masterVolume: number
  mouseSensitivity: number
  invertY: boolean
}

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  mouseSensitivity: 1,
  invertY: false,
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as GameSettings
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: GameSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
