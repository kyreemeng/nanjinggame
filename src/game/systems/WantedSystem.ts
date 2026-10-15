/** Phase 3 — heat / police response hook. */
export type WantedTier = 0 | 1 | 2 | 3 | 4 | 5

export interface WantedState {
  tier: WantedTier
  heat: number
}

export class WantedSystem {
  private state: WantedState = { tier: 0, heat: 0 }

  getState(): WantedState {
    return this.state
  }

  addHeat(amount: number): void {
    this.state.heat = Math.max(0, this.state.heat + amount)
    this.state.tier = Math.min(5, Math.floor(this.state.heat / 25)) as WantedTier
  }

  decay(dt: number): void {
    this.state.heat = Math.max(0, this.state.heat - dt * 4)
    this.state.tier = Math.min(5, Math.floor(this.state.heat / 25)) as WantedTier
  }
}
