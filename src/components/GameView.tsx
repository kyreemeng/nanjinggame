import { useEffect, useRef } from 'react'
import { GameEngine } from '../game/GameEngine'
import { useGameStore } from '../game/store/gameStore'
import { useSettingsStore } from '../game/store/settingsStore'
import { t } from '../i18n'

export function GameView() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GameEngine | null>(null)
  const phase = useGameStore((s) => s.phase)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new GameEngine(canvas)
    engineRef.current = engine

    engine.start().catch((err) => {
      console.error('Failed to start game', err)
      const message = err instanceof Error ? err.message : t('boot.unknownError')
      useGameStore.getState().setBootError(message)
      useGameStore.getState().setPhase('menu')
    })

    const onResize = () => engine.onResize()
    window.addEventListener('resize', onResize)

    const unsubSettings = useSettingsStore.subscribe((state, prev) => {
      if (state.graphics !== prev.graphics) {
        engineRef.current?.applyGraphics(state.graphics)
      }
      if (state.locale !== prev.locale) {
        engineRef.current?.notifyLocaleChanged()
      }
    })

    return () => {
      window.removeEventListener('resize', onResize)
      unsubSettings()
      engine.stop()
      engineRef.current = null
    }
  }, [])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    if (phase === 'playing') {
      engine.resume()
    } else {
      engine.pause()
    }
  }, [phase])

  return <canvas ref={canvasRef} className="game-canvas" id="game-canvas" />
}
