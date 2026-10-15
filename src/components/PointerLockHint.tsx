import { useEffect, useState } from 'react'
import { useTranslation } from '../i18n'

export function PointerLockHint() {
  const { t } = useTranslation()
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
      {t('pointer.hint')}
    </div>
  )
}
