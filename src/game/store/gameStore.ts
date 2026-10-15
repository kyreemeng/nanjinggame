import { create } from 'zustand'

export type GamePhase = 'menu' | 'playing' | 'paused'

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
      >
    >,
  ) => void
  resetRun: () => void
}

export const useGameStore = create<GameStoreState>((set) => ({
  phase: 'menu',
  health: 100,
  money: 320,
  objective: 'Scout Harbor Row — find the courier drop.',
  speedKmh: 0,
  fps: 0,
  compassDeg: 0,
  playerX: 0,
  playerZ: 0,
  driving: false,
  canEnterVehicle: false,
  setPhase: (phase) => set({ phase }),
  setHud: (partial) => set(partial),
  resetRun: () =>
    set({
      health: 100,
      money: 320,
      speedKmh: 0,
      driving: false,
      canEnterVehicle: false,
    }),
}))
