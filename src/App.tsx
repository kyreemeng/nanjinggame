import { useEffect, useState } from 'react'
import { GameView } from './components/GameView'
import { FullMapOverlay } from './components/hud/FullMapOverlay'
import { HUD } from './components/hud/HUD'
import { MainMenu } from './components/menus/MainMenu'
import { PauseMenu } from './components/menus/PauseMenu'
import { PointerLockHint } from './components/PointerLockHint'
import { GameBootError } from './components/GameBootError'
import { useGameStore } from './game/store/gameStore'
import { useSettingsStore } from './game/store/settingsStore'

function App() {
  const phase = useGameStore((s) => s.phase)
  const mapOpen = useGameStore((s) => s.mapOpen)
  const setMapOpen = useGameStore((s) => s.setMapOpen)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionKey, setSessionKey] = useState(0)
  useEffect(() => {
    useSettingsStore.getState().hydrate()
  }, [])

  useEffect(() => {
    if (phase === 'playing' || phase === 'paused') {
      setSessionStarted(true)
    }
  }, [phase])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const bindings = useSettingsStore.getState().bindings
      const current = useGameStore.getState().phase

      if (e.code === bindings.map && current === 'playing') {
        e.preventDefault()
        const next = !useGameStore.getState().mapOpen
        useGameStore.getState().setMapOpen(next)
        if (next && document.pointerLockElement) {
          document.exitPointerLock()
        }
        return
      }

      if (e.code === 'Escape') {
        if (useGameStore.getState().mapOpen) {
          e.preventDefault()
          setMapOpen(false)
          return
        }
        if (current === 'playing') {
          e.preventDefault()
          useGameStore.getState().setPhase('paused')
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setMapOpen])

  const onStartSession = () => setSessionKey((k) => k + 1)

  const inWorld = sessionStarted && phase !== 'menu'
  const showHud = inWorld && phase === 'playing' && !mapOpen

  return (
    <div className="app-shell">
      {sessionStarted && <GameView key={sessionKey} />}
      {showHud && (
        <>
          <HUD />
          <PointerLockHint />
        </>
      )}
      {inWorld && mapOpen && <FullMapOverlay />}
      <GameBootError />
      {phase === 'menu' && <MainMenu onStartSession={onStartSession} />}
      {phase === 'paused' && <PauseMenu />}
    </div>
  )
}

export default App
