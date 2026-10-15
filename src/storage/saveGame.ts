import type { MissionSaveSlice } from '../game/missions/MissionManager'
import { loadSettings, saveSettings, type GameSettings } from './settings'
import { useGameStore } from '../game/store/gameStore'

const SAVE_KEY = 'ashline-save-v1'

export interface GameSave {
  version: 1
  money: number
  health: number
  missions: MissionSaveSlice
  settings: GameSettings
  savedAt: number
}

export function hasSave(): boolean {
  try {
    return localStorage.getItem(SAVE_KEY) !== null
  } catch {
    return false
  }
}

export function loadSave(): GameSave | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as GameSave
  } catch {
    return null
  }
}

export function saveGame(): void {
  const state = useGameStore.getState()
  const payload: GameSave = {
    version: 1,
    money: state.money,
    health: state.health,
    missions: state.missionSave,
    settings: loadSettings(),
    savedAt: Date.now(),
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload))
  state.setHud({ missionToast: 'Progress saved.' })
}

export function applySaveToStore(save: GameSave): void {
  useGameStore.getState().hydrateFromSave({
    money: save.money,
    health: save.health,
    missionSave: save.missions,
  })
  saveSettings(save.settings)
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY)
}

export function defaultMissionSave(): MissionSaveSlice {
  return {
    completedIds: [],
    activeId: 'tutorial',
    progress: { tutorial: { move: 0, look: 0, talk: false } },
  }
}
