import { useTranslation } from '../../i18n'
import type { Locale } from '../../i18n/messages'
import { useSettingsStore } from '../../game/store/settingsStore'
import { playMenuClick } from './playClick'

interface LanguagePickerProps {
  compact?: boolean
}

export function LanguagePicker({ compact }: LanguagePickerProps) {
  const { t, locale } = useTranslation()
  const patch = useSettingsStore((s) => s.patch)

  const setLocale = (next: Locale) => {
    if (next === locale) return
    playMenuClick()
    patch({ locale: next })
  }

  return (
    <div className={compact ? 'language-row compact' : 'language-row'}>
      <span className="language-label">{t('menu.language')}</span>
      <div className="language-buttons">
        <button
          type="button"
          className={`menu-btn ${locale === 'en' ? 'primary' : ''}`}
          onClick={() => setLocale('en')}
        >
          {t('locale.en')}
        </button>
        <button
          type="button"
          className={`menu-btn ${locale === 'zh' ? 'primary' : ''}`}
          onClick={() => setLocale('zh')}
        >
          {t('locale.zh')}
        </button>
      </div>
    </div>
  )
}
