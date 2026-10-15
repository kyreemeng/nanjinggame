/** Phase 2+ mission system hooks — not wired in Phase 1 gameplay yet. */
export type MissionState = 'inactive' | 'active' | 'completed' | 'failed'

export interface MissionDefinition {
  id: string
  title: string
  description: string
}

export interface MissionRuntime {
  definition: MissionDefinition
  state: MissionState
}
