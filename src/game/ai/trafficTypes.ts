/** Phase 3 — traffic AI will spawn vehicles along road splines. */
export type TrafficLaneId = string

export interface TrafficVehicleSlot {
  laneId: TrafficLaneId
  progress: number
  speed: number
}

export interface TrafficSystem {
  tick(dt: number): void
  setDensity(level: number): void
}

export function createTrafficSystemStub(): TrafficSystem {
  return {
    tick() {},
    setDensity() {},
  }
}
