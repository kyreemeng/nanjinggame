import { useEffect, useRef } from 'react'
import { GameEngine } from '../game/GameEngine'
import { useGameStore } from '../game/store/gameStore'

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
    })

    const onResize = () => engine.onResize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
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
