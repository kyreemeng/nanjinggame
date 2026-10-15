import { useGameStore } from '../game/store/gameStore'
import { playMenuClick } from './menus/playClick'

export function GameBootError() {
  const message = useGameStore((s) => s.bootError)
  const setBootError = useGameStore((s) => s.setBootError)
  const setPhase = useGameStore((s) => s.setPhase)

  if (!message) return null

  return (
    <div className="menu-overlay dim">
      <div className="menu-card menu-card-tech">
        <h2>Could not start 3D world</h2>
        <p className="menu-sub boot-error-text">{message}</p>
        <p className="menu-hint">
          Ashline needs WebGL in your browser. Try another browser, enable hardware acceleration, or
          update graphics drivers.
        </p>
        <button
          type="button"
          className="menu-btn primary"
          onClick={() => {
            playMenuClick()
            setBootError(null)
            setPhase('menu')
          }}
        >
          Back to Main Menu
        </button>
      </div>
    </div>
  )
}
