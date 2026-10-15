import { create } from 'zustand'
import type { MissionSaveSlice } from '../missions/MissionManager'
import { defaultMissionSave } from '../../storage/saveGame'

export type GamePhase = 'menu' | 'playing' | 'paused'

export interface MapMarker {
  x: number
  z: number
  label?: string
}

export interface GameStoreState {
  phase: GamePhase
  health: number
  money: number
  objective: string
  speedKmh: number
  fps: number
  compassDeg: number
  playerX: number
  playerZ: number
  driving: boolean
  canEnterVehicle: boolean
  missionToast: string | null
  missionTimerSec: number | null
  mapMarkers: MapMarker[]
  missionSave: MissionSaveSlice
  newGameSession: boolean
  wantedStars: number
  npcPrompt: string | null
  setPhase: (phase: GamePhase) => void
  setHud: (
    partial: Partial<
      Pick<
        GameStoreState,
        | 'health'
        | 'money'
        | 'objective'
        | 'speedKmh'
        | 'fps'
        | 'compassDeg'
        | 'playerX'
        | 'playerZ'
        | 'driving'
        | 'canEnterVehicle'
        | 'missionToast'
        | 'missionTimerSec'
        | 'mapMarkers'
        | 'wantedStars'
        | 'npcPrompt'
      >
    >,
  ) => void
  setMissionSave: (slice: MissionSaveSlice) => void
  setNewGameSession: (v: boolean) => void
  hydrateFromSave: (data: { money: number; health: number; missionSave: MissionSaveSlice }) => void
  resetRun: () => void
}

export const useGameStore = create<GameStoreState>((set) => ({
  phase: 'menu',
  health: 100,
  money: 320,
  objective: 'Contract: First Steps',
  speedKmh: 0,
  fps: 0,
  compassDeg: 0,
  playerX: 0,
  playerZ: 0,
  driving: false,
  canEnterVehicle: false,
  missionToast: null,
  missionTimerSec: null,
  mapMarkers: [],
  missionSave: defaultMissionSave(),
  newGameSession: true,
  wantedStars: 0,
  npcPrompt: null,
  setPhase: (phase) => set({ phase }),
  setHud: (partial) => set(partial),
  setMissionSave: (slice) => set({ missionSave: slice }),
  setNewGameSession: (v) => set({ newGameSession: v }),
  hydrateFromSave: (data) =>
    set({
      money: data.money,
      health: data.health,
      missionSave: data.missionSave,
      newGameSession: false,
    }),
  resetRun: () =>
    set({
      health: 100,
      money: 320,
      speedKmh: 0,
      driving: false,
      canEnterVehicle: false,
      missionToast: null,
      missionTimerSec: null,
      mapMarkers: [],
      missionSave: defaultMissionSave(),
      newGameSession: true,
      wantedStars: 0,
      npcPrompt: null,
      objective: 'Contract: First Steps',
    }),
}))
