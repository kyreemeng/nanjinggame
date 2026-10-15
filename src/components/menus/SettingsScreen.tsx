import { useState } from 'react'
import { ACTION_LABELS, formatKeyCode, type GameAction } from '../../game/input/actions'
import { useSettingsStore } from '../../game/store/settingsStore'
import type { GraphicsPreset } from '../../storage/settings'
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

  return (
    <MenuShell title="Settings" subtitle="Graphics, audio, and controls" onBack={onBack} wide>
      <div className="settings-grid">
        <label>
          Master volume
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
          SFX volume
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
          Music volume
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
          Mouse sensitivity
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
          Invert Y axis
        </label>
      </div>

      <p className="settings-section-title">Graphics</p>
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
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </button>
        ))}
      </div>

      <p className="settings-section-title">Key bindings</p>
      <div className="bind-list">
        {BIND_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            className="bind-row"
            onClick={() => startListen(action)}
          >
            <span>{ACTION_LABELS[action]}</span>
            <span className="bind-key">
              {listening === action ? 'Press key…' : formatKeyCode(settings.bindings[action])}
            </span>
          </button>
        ))}
      </div>
    </MenuShell>
  )
}
