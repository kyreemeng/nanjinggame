import { useGameStore } from '../../game/store/gameStore'
import { saveGame } from '../../storage/saveGame'

export function PauseMenu() {
  const setPhase = useGameStore((s) => s.setPhase)

  return (
    <div className="menu-overlay dim">
      <div className="menu-card">
        <h2>Paused</h2>
        <button type="button" className="menu-btn primary" onClick={() => setPhase('playing')}>
          Resume
        </button>
        <button type="button" className="menu-btn" onClick={() => saveGame()}>
          Save Game
        </button>
        <button type="button" className="menu-btn" onClick={() => setPhase('menu')}>
          Main Menu
        </button>
      </div>
    </div>
  )
}
