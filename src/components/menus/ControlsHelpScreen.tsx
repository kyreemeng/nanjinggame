import { ACTION_LABELS, formatKeyCode } from '../../game/input/actions'
import { useSettingsStore } from '../../game/store/settingsStore'
import { MenuShell } from './MenuShell'

interface ControlsHelpScreenProps {
  onBack: () => void
}

export function ControlsHelpScreen({ onBack }: ControlsHelpScreenProps) {
  const bindings = useSettingsStore((s) => s.bindings)

  return (
    <MenuShell title="Controls" subtitle="Default bindings — customize in Settings" onBack={onBack} wide>
      <ul className="controls-list">
        {Object.entries(ACTION_LABELS).map(([action, label]) => (
          <li key={action}>
            <span>{label}</span>
            <kbd>{formatKeyCode(bindings[action as keyof typeof bindings])}</kbd>
          </li>
        ))}
        <li>
          <span>Pause menu</span>
          <kbd>Esc</kbd>
        </li>
        <li>
          <span>Steer / drive (alt)</span>
          <kbd>Arrow keys</kbd>
        </li>
      </ul>
    </MenuShell>
  )
}
