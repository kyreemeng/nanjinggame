import { create } from 'zustand'
import { loadSettings, saveSettings, type GameSettings, DEFAULT_SETTINGS } from '../../storage/settings'
import type { GameAction } from '../input/actions'

interface SettingsStore extends GameSettings {
  hydrate: () => void
  patch: (partial: Partial<GameSettings>) => void
  setBinding: (action: GameAction, code: string) => void
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULT_SETTINGS,
  bindings: { ...DEFAULT_SETTINGS.bindings },
  hydrate: () => {
    const loaded = loadSettings()
    set({ ...loaded })
  },
  patch: (partial) => {
    const next = { ...get(), ...partial }
    saveSettings({
      masterVolume: next.masterVolume,
      sfxVolume: next.sfxVolume,
      musicVolume: next.musicVolume,
      mouseSensitivity: next.mouseSensitivity,
      invertY: next.invertY,
      graphics: next.graphics,
      bindings: next.bindings,
    })
    set(partial)
  },
  setBinding: (action, code) => {
    const bindings = { ...get().bindings, [action]: code }
    get().patch({ bindings })
  },
}))
