import { useState } from 'react'
import { useGameStore } from '../../game/store/gameStore'
import { useTranslation } from '../../i18n'
import { saveGame } from '../../storage/saveGame'
import { ControlsHelpScreen } from './ControlsHelpScreen'
import { LanguagePicker } from './LanguagePicker'
import { MissionListScreen } from './MissionListScreen'
import { playMenuClick } from './playClick'
import { SettingsScreen } from './SettingsScreen'

type SubScreen = null | 'missions' | 'settings' | 'controls'

export function PauseMenu() {
  const { t } = useTranslation()
  const setPhase = useGameStore((s) => s.setPhase)
  const setMapOpen = useGameStore((s) => s.setMapOpen)
  const [sub, setSub] = useState<SubScreen>(null)

  if (sub === 'missions') return <MissionListScreen onBack={() => setSub(null)} />
  if (sub === 'settings') return <SettingsScreen onBack={() => setSub(null)} />
  if (sub === 'controls') return <ControlsHelpScreen onBack={() => setSub(null)} />

  return (
    <div className="menu-overlay dim">
      <div className="menu-card menu-card-tech">
        <h2>{t('pause.title')}</h2>
        <LanguagePicker compact />
        <button
          type="button"
          className="menu-btn primary"
          onClick={() => {
            playMenuClick()
            setPhase('playing')
          }}
        >
          {t('pause.resume')}
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
          {t('pause.map')}
        </button>
        <button type="button" className="menu-btn" onClick={() => setSub('missions')}>
          {t('menu.contracts')}
        </button>
        <button type="button" className="menu-btn" onClick={() => setSub('settings')}>
          {t('menu.settings')}
        </button>
        <button type="button" className="menu-btn" onClick={() => setSub('controls')}>
          {t('menu.controls')}
        </button>
        <button
          type="button"
          className="menu-btn"
          onClick={() => {
            playMenuClick()
            saveGame()
          }}
        >
          {t('pause.save')}
        </button>
        <button
          type="button"
          className="menu-btn"
          onClick={() => {
            playMenuClick()
            setPhase('menu')
          }}
        >
          {t('pause.mainMenu')}
        </button>
      </div>
    </div>
  )
}
