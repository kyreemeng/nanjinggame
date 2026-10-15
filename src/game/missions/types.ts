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
