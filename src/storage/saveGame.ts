import type { MissionSaveSlice } from '../game/missions/MissionManager'
import { landmarkWorldPosition } from '../map-data/landmarks'
import { t } from '../i18n'
import { loadSettings, saveSettings, type GameSettings } from './settings'
import { useGameStore } from '../game/store/gameStore'
import { useSettingsStore } from '../game/store/settingsStore'

const SAVE_KEY = 'ashline-save-v2'
const LEGACY_KEY = 'ashline-save-v1'

export interface WorldPose {
  player: { x: number; y: number; z: number }
  vehicle: { x: number; y: number; z: number; yaw: number }
  mode: 'foot' | 'vehicle'
}

export interface GameSave {
  version: 2
  money: number
  health: number
  missions: MissionSaveSlice
  settings: GameSettings
  world: WorldPose
  savedAt: number
}

export function hasSave(): boolean {
  try {
    return localStorage.getItem(SAVE_KEY) !== null || localStorage.getItem(LEGACY_KEY) !== null
  } catch {
    return false
  }
}

export function loadSave(): GameSave | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<GameSave> & { version?: number }
    if (parsed.version === 2 && parsed.world) {
      return parsed as GameSave
    }
    return {
      version: 2,
      money: parsed.money ?? 320,
      health: parsed.health ?? 100,
      missions: parsed.missions ?? defaultMissionSave(),
      settings: { ...loadSettings(), ...parsed.settings },
      world: defaultWorldPose(),
      savedAt: parsed.savedAt ?? Date.now(),
    }
  } catch {
    return null
  }
}

export function defaultWorldPose(): WorldPose {
  const base = landmarkWorldPosition('xinjiekou') ?? { x: 0, y: 0, z: 0 }
  return {
    player: { x: base.x - 8, y: 16.1, z: base.z + 6 },
    vehicle: { x: base.x + 12, y: 15.65, z: base.z - 10, yaw: 0 },
    mode: 'foot',
  }
}

export function saveGame(): void {
  const state = useGameStore.getState()
  const settings = useSettingsStore.getState()
  const world = state.worldPose ?? defaultWorldPose()
  const payload: GameSave = {
    version: 2,
    money: state.money,
    health: state.health,
    missions: state.missionSave,
    settings: {
      masterVolume: settings.masterVolume,
      sfxVolume: settings.sfxVolume,
      musicVolume: settings.musicVolume,
      mouseSensitivity: settings.mouseSensitivity,
      invertY: settings.invertY,
      graphics: settings.graphics,
      bindings: settings.bindings,
      locale: settings.locale,
    },
    world,
    savedAt: Date.now(),
  }
  saveSettings(payload.settings)
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload))
  localStorage.removeItem(LEGACY_KEY)
  state.setHud({ missionToast: t('save.progressSaved') })
}

export function applySaveToStore(save: GameSave): void {
  useGameStore.getState().hydrateFromSave({
    money: save.money,
    health: save.health,
    missionSave: save.missions,
    worldPose: save.world ?? defaultWorldPose(),
  })
  saveSettings(save.settings)
  useSettingsStore.getState().hydrate()
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY)
  localStorage.removeItem(LEGACY_KEY)
}

export function defaultMissionSave(): MissionSaveSlice {
  return {
    completedIds: [],
    activeId: 'tutorial',
    progress: { tutorial: { move: 0, look: 0, talk: false } },
  }
}
