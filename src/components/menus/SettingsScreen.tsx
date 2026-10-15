import { useState } from 'react'
import { formatKeyCode, type GameAction } from '../../game/input/actions'
import { useSettingsStore } from '../../game/store/settingsStore'
import { useTranslation, type MessageKey } from '../../i18n'
import type { GraphicsPreset } from '../../storage/settings'
import { LanguagePicker } from './LanguagePicker'
import { MenuShell } from './MenuShell'
import { playMenuClick } from './playClick'

const BIND_ACTIONS: GameAction[] = [
  'forward',
  'back',
  'left',
  'right',
  'run',
  'jump',
  'interact',
  'map',
  'accelerate',
  'brake',
]

interface SettingsScreenProps {
  onBack: () => void
  onGraphicsChange?: (preset: GraphicsPreset) => void
}

export function SettingsScreen({ onBack, onGraphicsChange }: SettingsScreenProps) {
  const { t } = useTranslation()
  const settings = useSettingsStore()
  const [listening, setListening] = useState<GameAction | null>(null)

  const startListen = (action: GameAction) => {
    playMenuClick()
    setListening(action)
    const handler = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      settings.setBinding(action, e.code)
      setListening(null)
      window.removeEventListener('keydown', handler, true)
    }
    window.addEventListener('keydown', handler, true)
  }

  const graphicsLabel = (g: GraphicsPreset) => t(`graphics.${g}`)

  return (
    <MenuShell title={t('settings.title')} subtitle={t('settings.subtitle')} onBack={onBack} wide>
      <LanguagePicker />
      <div className="settings-grid">
        <label>
          {t('settings.masterVolume')}
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.masterVolume}
            onChange={(e) => settings.patch({ masterVolume: Number(e.target.value) })}
          />
        </label>
        <label>
          {t('settings.sfxVolume')}
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.sfxVolume}
            onChange={(e) => settings.patch({ sfxVolume: Number(e.target.value) })}
          />
        </label>
        <label>
          {t('settings.musicVolume')}
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.musicVolume}
            onChange={(e) => settings.patch({ musicVolume: Number(e.target.value) })}
          />
        </label>
        <label>
          {t('settings.mouseSensitivity')}
          <input
            type="range"
            min={0.4}
            max={2}
            step={0.1}
            value={settings.mouseSensitivity}
            onChange={(e) => settings.patch({ mouseSensitivity: Number(e.target.value) })}
          />
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={settings.invertY}
            onChange={(e) => settings.patch({ invertY: e.target.checked })}
          />
          {t('settings.invertY')}
        </label>
      </div>

      <p className="settings-section-title">{t('settings.graphics')}</p>
      <div className="graphics-row">
        {(['low', 'medium', 'high'] as GraphicsPreset[]).map((g) => (
          <button
            key={g}
            type="button"
            className={`menu-btn ${settings.graphics === g ? 'primary' : ''}`}
            onClick={() => {
              playMenuClick()
              settings.patch({ graphics: g })
              onGraphicsChange?.(g)
            }}
          >
            {graphicsLabel(g)}
          </button>
        ))}
      </div>

      <p className="settings-section-title">{t('settings.keyBindings')}</p>
      <div className="bind-list">
        {BIND_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            className="bind-row"
            onClick={() => startListen(action)}
          >
            <span>{t(`action.${action}` as MessageKey)}</span>
            <span className="bind-key">
              {listening === action ? t('settings.pressKey') : formatKeyCode(settings.bindings[action])}
            </span>
          </button>
        ))}
      </div>
    </MenuShell>
  )
}
