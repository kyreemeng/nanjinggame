/** Phase 3 — pedestrian crowds on sidewalks. */
export interface PedestrianAgent {
  id: string
  position: { x: number; y: number; z: number }
  heading: number
}

export interface PedestrianSystem {
  tick(dt: number): void
  setDensity(level: number): void
}

export function createPedestrianSystemStub(): PedestrianSystem {
  return {
    tick() {},
    setDensity() {},
  }
}
