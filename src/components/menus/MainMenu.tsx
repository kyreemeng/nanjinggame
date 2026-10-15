import { DISTRICT_NAME, GAME_TITLE } from '../../game/constants'
import { useGameStore } from '../../game/store/gameStore'

export function MainMenu() {
  const setPhase = useGameStore((s) => s.setPhase)
  const resetRun = useGameStore((s) => s.resetRun)

  const start = () => {
    resetRun()
    setPhase('playing')
  }

  return (
    <div className="menu-overlay">
      <div className="menu-card">
        <p className="menu-eyebrow">Open district action</p>
        <h1>{GAME_TITLE}</h1>
        <p className="menu-sub">{DISTRICT_NAME}</p>
        <button type="button" className="menu-btn primary" onClick={start}>
          Start Game
        </button>
        <p className="menu-hint">WASD move · Shift run · Space jump · E vehicle · Esc pause</p>
      </div>
    </div>
  )
}
