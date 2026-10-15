import { useEffect, useState } from 'react'
import { DISTRICT_NAME, GAME_TITLE } from '../../game/constants'
import { useGameStore } from '../../game/store/gameStore'
import { applySaveToStore, hasSave, loadSave } from '../../storage/saveGame'
import { ControlsHelpScreen } from './ControlsHelpScreen'
import { MissionListScreen } from './MissionListScreen'
import { playMenuClick } from './playClick'
import { SettingsScreen } from './SettingsScreen'

type SubScreen = null | 'missions' | 'settings' | 'controls'

interface MainMenuProps {
  onStartSession: () => void
}

export function MainMenu({ onStartSession }: MainMenuProps) {
  const setPhase = useGameStore((s) => s.setPhase)
  const resetRun = useGameStore((s) => s.resetRun)
  const setNewGameSession = useGameStore((s) => s.setNewGameSession)
  const [canContinue, setCanContinue] = useState(false)
  const [sub, setSub] = useState<SubScreen>(null)

  useEffect(() => {
    setCanContinue(hasSave())
  }, [])

  if (sub === 'missions') return <MissionListScreen onBack={() => setSub(null)} />
  if (sub === 'settings') return <SettingsScreen onBack={() => setSub(null)} />
  if (sub === 'controls') return <ControlsHelpScreen onBack={() => setSub(null)} />

  const startNew = () => {
    playMenuClick()
    resetRun()
    setNewGameSession(true)
    onStartSession()
    setPhase('playing')
  }

  const continueGame = () => {
    playMenuClick()
    const save = loadSave()
    if (!save) return
    applySaveToStore(save)
    onStartSession()
    setPhase('playing')
  }

  const nav = (screen: SubScreen) => {
    playMenuClick()
    setSub(screen)
  }

  return (
    <div className="menu-overlay menu-main">
      <div className="menu-hero">
        <p className="menu-eyebrow">Open district action</p>
        <h1>{GAME_TITLE}</h1>
        <p className="menu-sub">{DISTRICT_NAME}</p>
      </div>
      <div className="menu-card menu-card-tech menu-actions">
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
        <button type="button" className="menu-btn" onClick={() => nav('missions')}>
          Contracts
        </button>
        <button type="button" className="menu-btn" onClick={() => nav('settings')}>
          Settings
        </button>
        <button type="button" className="menu-btn" onClick={() => nav('controls')}>
          Controls
        </button>
      </div>
    </div>
  )
}
