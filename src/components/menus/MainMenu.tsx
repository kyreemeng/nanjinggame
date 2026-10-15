import { useEffect, useState } from 'react'
import { DISTRICT_NAME, GAME_TITLE } from '../../game/constants'
import { useGameStore } from '../../game/store/gameStore'
import { applySaveToStore, hasSave, loadSave } from '../../storage/saveGame'

interface MainMenuProps {
  onStartSession: () => void
}

export function MainMenu({ onStartSession }: MainMenuProps) {
  const setPhase = useGameStore((s) => s.setPhase)
  const resetRun = useGameStore((s) => s.resetRun)
  const setNewGameSession = useGameStore((s) => s.setNewGameSession)
  const [canContinue, setCanContinue] = useState(false)

  useEffect(() => {
    setCanContinue(hasSave())
  }, [])

  const startNew = () => {
    resetRun()
    setNewGameSession(true)
    onStartSession()
    setPhase('playing')
  }

  const continueGame = () => {
    const save = loadSave()
    if (!save) return
    applySaveToStore(save)
    onStartSession()
    setPhase('playing')
  }

  return (
    <div className="menu-overlay">
      <div className="menu-card">
        <p className="menu-eyebrow">Open district action</p>
        <h1>{GAME_TITLE}</h1>
        <p className="menu-sub">{DISTRICT_NAME}</p>
        {canContinue && (
          <button type="button" className="menu-btn primary" onClick={continueGame}>
            Continue
          </button>
        )}
        <button
          type="button"
          className={canContinue ? 'menu-btn' : 'menu-btn primary'}
          onClick={startNew}
        >
          {canContinue ? 'New Game' : 'Start Game'}
        </button>
        <p className="menu-hint">WASD move · Shift run · E interact · Esc pause</p>
      </div>
    </div>
  )
}
