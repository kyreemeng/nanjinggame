import { useGameStore } from '../../game/store/gameStore'

export function MissionToast() {
  const toast = useGameStore((s) => s.missionToast)
  if (!toast) return null
  return <div className="mission-toast">{toast}</div>
}
