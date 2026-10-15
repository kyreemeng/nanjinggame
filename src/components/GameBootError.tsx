import { useGameStore } from '../game/store/gameStore'
import { useTranslation } from '../i18n'
import { playMenuClick } from './menus/playClick'

export function GameBootError() {
  const { t } = useTranslation()
  const message = useGameStore((s) => s.bootError)
  const setBootError = useGameStore((s) => s.setBootError)
  const setPhase = useGameStore((s) => s.setPhase)

  if (!message) return null

  return (
    <div className="menu-overlay dim">
      <div className="menu-card menu-card-tech">
        <h2>{t('boot.title')}</h2>
        <p className="menu-sub boot-error-text">{message}</p>
        <p className="menu-hint">{t('boot.hint')}</p>
        <button
          type="button"
          className="menu-btn primary"
          onClick={() => {
            playMenuClick()
            setBootError(null)
            setPhase('menu')
          }}
        >
          {t('boot.back')}
        </button>
      </div>
    </div>
  )
}
