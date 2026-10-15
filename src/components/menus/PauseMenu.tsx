import { useState } from 'react'
import { useGameStore } from '../../game/store/gameStore'
import { saveGame } from '../../storage/saveGame'
import { ControlsHelpScreen } from './ControlsHelpScreen'
import { MissionListScreen } from './MissionListScreen'
import { playMenuClick } from './playClick'
import { SettingsScreen } from './SettingsScreen'

type SubScreen = null | 'missions' | 'settings' | 'controls'

export function PauseMenu() {
  const setPhase = useGameStore((s) => s.setPhase)
  const setMapOpen = useGameStore((s) => s.setMapOpen)
  const [sub, setSub] = useState<SubScreen>(null)

  if (sub === 'missions') return <MissionListScreen onBack={() => setSub(null)} />
  if (sub === 'settings') return <SettingsScreen onBack={() => setSub(null)} />
  if (sub === 'controls') return <ControlsHelpScreen onBack={() => setSub(null)} />

  return (
    <div className="menu-overlay dim">
      <div className="menu-card menu-card-tech">
        <h2>Paused</h2>
        <button
          type="button"
          className="menu-btn primary"
          onClick={() => {
            playMenuClick()
            setPhase('playing')
          }}
        >
          Resume
        </button>
        <button
          type="button"
          className="menu-btn"
          onClick={() => {
            playMenuClick()
            setMapOpen(true)
            setPhase('playing')
          }}
        >
          Map
        </button>
        <button type="button" className="menu-btn" onClick={() => setSub('missions')}>
          Contracts
        </button>
        <button type="button" className="menu-btn" onClick={() => setSub('settings')}>
          Settings
        </button>
        <button type="button" className="menu-btn" onClick={() => setSub('controls')}>
          Controls
        </button>
        <button
          type="button"
          className="menu-btn"
          onClick={() => {
            playMenuClick()
            saveGame()
          }}
        >
          Save Game
        </button>
        <button
          type="button"
          className="menu-btn"
          onClick={() => {
            playMenuClick()
            setPhase('menu')
          }}
        >
          Main Menu
        </button>
      </div>
    </div>
  )
}
