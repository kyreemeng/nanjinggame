import { MISSIONS } from '../../game/missions/missionDefinitions'
import type { MissionSaveSlice } from '../../game/missions/MissionManager'
import { useGameStore } from '../../game/store/gameStore'
import { defaultMissionSave, loadSave } from '../../storage/saveGame'
import { MenuShell } from './MenuShell'

interface MissionListScreenProps {
  onBack: () => void
  /** When true, show mission progress from disk save (main menu). */
  preferDiskSave?: boolean
}

function resolveMissionSave(preferDisk: boolean): MissionSaveSlice {
  if (preferDisk) {
    const disk = loadSave()
    if (disk) return disk.missions
    return defaultMissionSave()
  }
  return useGameStore.getState().missionSave
}

export function MissionListScreen({ onBack, preferDiskSave = false }: MissionListScreenProps) {
  const liveSave = useGameStore((s) => s.missionSave)
  const missionSave = preferDiskSave ? resolveMissionSave(true) : liveSave
  const completed = new Set(missionSave.completedIds)
  const active = missionSave.activeId

  return (
    <MenuShell title="Contracts" subtitle="Live mission state from your save" onBack={onBack} wide>
      <ul className="mission-list">
        {MISSIONS.map((m, index) => {
          const priorDone = MISSIONS.slice(0, index).every((x) => completed.has(x.id))
          const status = completed.has(m.id)
            ? 'completed'
            : active === m.id
              ? 'active'
              : priorDone
                ? 'pending'
                : 'locked'
          return (
            <li key={m.id} className={`mission-item status-${status}`}>
              <div className="mission-item-head">
                <strong>{m.title}</strong>
                <span className="mission-badge">{status}</span>
              </div>
              <p>{m.description}</p>
              <span className="mission-reward">Reward ${m.reward}</span>
            </li>
          )
        })}
      </ul>
    </MenuShell>
  )
}
