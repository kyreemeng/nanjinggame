import { useEffect, useState } from 'react'
import { GAME_TITLE } from '../../game/constants'
import { useGameStore } from '../../game/store/gameStore'
import { useTranslation } from '../../i18n'
import { applySaveToStore, clearSave, hasSave, loadSave } from '../../storage/saveGame'
import { ControlsHelpScreen } from './ControlsHelpScreen'
import { LanguagePicker } from './LanguagePicker'
import { MissionListScreen } from './MissionListScreen'
import { playMenuClick } from './playClick'
import { SettingsScreen } from './SettingsScreen'

type SubScreen = null | 'missions' | 'settings' | 'controls'

interface MainMenuProps {
  onStartSession: () => void
}

export function MainMenu({ onStartSession }: MainMenuProps) {
  const { t } = useTranslation()
  const setPhase = useGameStore((s) => s.setPhase)
  const resetRun = useGameStore((s) => s.resetRun)
  const setNewGameSession = useGameStore((s) => s.setNewGameSession)
  const [canContinue, setCanContinue] = useState(false)
  const [sub, setSub] = useState<SubScreen>(null)

  useEffect(() => {
    setCanContinue(hasSave())
  }, [])

  if (sub === 'missions')
    return <MissionListScreen preferDiskSave onBack={() => setSub(null)} />
  if (sub === 'settings') return <SettingsScreen onBack={() => setSub(null)} />
  if (sub === 'controls') return <ControlsHelpScreen onBack={() => setSub(null)} />

  const startNew = () => {
    playMenuClick()
    clearSave()
    setCanContinue(false)
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
        <p className="menu-eyebrow">{t('brand.eyebrow')}</p>
        <h1>{GAME_TITLE}</h1>
        <p className="menu-sub">{t('brand.district')}</p>
      </div>
      <div className="menu-card menu-card-tech menu-actions">
        <LanguagePicker compact />
        {canContinue && (
          <button type="button" className="menu-btn primary" onClick={continueGame}>
            {t('menu.continue')}
          </button>
        )}
        <button
          type="button"
          className={canContinue ? 'menu-btn' : 'menu-btn primary'}
          onClick={startNew}
        >
          {canContinue ? t('menu.newGame') : t('menu.startGame')}
        </button>
        <button type="button" className="menu-btn" onClick={() => nav('missions')}>
          {t('menu.contracts')}
        </button>
        <button type="button" className="menu-btn" onClick={() => nav('settings')}>
          {t('menu.settings')}
        </button>
        <button type="button" className="menu-btn" onClick={() => nav('controls')}>
          {t('menu.controls')}
        </button>
      </div>
    </div>
  )
}
