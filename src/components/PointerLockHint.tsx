import { useEffect, useState } from 'react'

export function PointerLockHint() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onChange = () => {
      setVisible(document.pointerLockElement?.id !== 'game-canvas')
    }
    document.addEventListener('pointerlockchange', onChange)
    return () => document.removeEventListener('pointerlockchange', onChange)
  }, [])

  if (!visible) return null

  return (
    <div className="pointer-hint" onClick={() => document.getElementById('game-canvas')?.requestPointerLock()}>
      Click to capture mouse · Esc to pause
    </div>
  )
}
