import { useEffect, useState } from 'react'
import { GameView } from './components/GameView'
import { HUD } from './components/hud/HUD'
import { MainMenu } from './components/menus/MainMenu'
import { PauseMenu } from './components/menus/PauseMenu'
import { PointerLockHint } from './components/PointerLockHint'
import { useGameStore } from './game/store/gameStore'

function App() {
  const phase = useGameStore((s) => s.phase)
  const [sessionStarted, setSessionStarted] = useState(false)

  useEffect(() => {
    if (phase === 'playing' || phase === 'paused') {
      setSessionStarted(true)
    }
  }, [phase])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Escape') return
      const current = useGameStore.getState().phase
      if (current === 'playing') {
        e.preventDefault()
        useGameStore.getState().setPhase('paused')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const inWorld = sessionStarted && phase !== 'menu'

  return (
    <div className="app-shell">
      {sessionStarted && <GameView />}
      {inWorld && phase === 'playing' && (
        <>
          <HUD />
          <PointerLockHint />
        </>
      )}
      {phase === 'menu' && <MainMenu />}
      {phase === 'paused' && <PauseMenu />}
    </div>
  )
}

export default App
