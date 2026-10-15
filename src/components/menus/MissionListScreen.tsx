import { MISSIONS } from '../../game/missions/missionDefinitions'
import { useGameStore } from '../../game/store/gameStore'
import { MenuShell } from './MenuShell'

interface MissionListScreenProps {
  onBack: () => void
}

export function MissionListScreen({ onBack }: MissionListScreenProps) {
  const missionSave = useGameStore((s) => s.missionSave)
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
