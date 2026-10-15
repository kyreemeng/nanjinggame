import { formatKeyCode, type GameAction } from '../../game/input/actions'
import { useSettingsStore } from '../../game/store/settingsStore'
import { useTranslation, type MessageKey } from '../../i18n'
import { MenuShell } from './MenuShell'

const DISPLAY_ACTIONS: GameAction[] = [
  'forward',
  'back',
  'left',
  'right',
  'run',
  'jump',
  'interact',
  'brake',
  'accelerate',
  'reverse',
  'steerLeft',
  'steerRight',
  'map',
]

interface ControlsHelpScreenProps {
  onBack: () => void
}

export function ControlsHelpScreen({ onBack }: ControlsHelpScreenProps) {
  const { t } = useTranslation()
  const bindings = useSettingsStore((s) => s.bindings)

  return (
    <MenuShell title={t('controls.title')} subtitle={t('controls.subtitle')} onBack={onBack} wide>
      <ul className="controls-list">
        {DISPLAY_ACTIONS.map((action) => (
          <li key={action}>
            <span>{t(`action.${action}` as MessageKey)}</span>
            <kbd>{formatKeyCode(bindings[action])}</kbd>
          </li>
        ))}
        <li>
          <span>{t('controls.pause')}</span>
          <kbd>Esc</kbd>
        </li>
        <li>
          <span>{t('controls.steerAlt')}</span>
          <kbd>{t('controls.arrowKeys')}</kbd>
        </li>
      </ul>
    </MenuShell>
  )
}
