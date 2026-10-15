import { useMemo } from 'react'
import { useSettingsStore } from '../game/store/settingsStore'
import {
  landmarkKey,
  MESSAGES,
  missionDescriptionKey,
  missionTitleKey,
  type Locale,
  type MessageKey,
} from './messages'

export type { Locale, MessageKey } from './messages'
export { missionDescriptionKey, missionTitleKey, landmarkKey } from './messages'

export function getLocale(): Locale {
  return useSettingsStore.getState().locale
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = params[key]
    return v === undefined ? `{${key}}` : String(v)
  })
}

export function t(key: MessageKey, params?: Record<string, string | number>, locale?: Locale): string {
  const loc = locale ?? getLocale()
  const table = MESSAGES[loc] ?? MESSAGES.en
  const template = table[key] ?? MESSAGES.en[key] ?? key
  return interpolate(template, params)
}

export function landmarkLabel(id: string, locale?: Locale): string {
  const key = landmarkKey(id)
  if (MESSAGES.en[key]) return t(key, undefined, locale)
  return id
}

export function missionTitle(id: string, locale?: Locale): string {
  const key = missionTitleKey(id)
  if (MESSAGES.en[key]) return t(key, undefined, locale)
  return id
}

export function useTranslation() {
  const locale = useSettingsStore((s) => s.locale)
  return useMemo(
    () => ({
      locale,
      t: (key: MessageKey, params?: Record<string, string | number>) => t(key, params, locale),
      missionTitle: (id: string) => missionTitle(id, locale),
      missionDescription: (id: string) => {
        const key = missionDescriptionKey(id)
        return t(key, undefined, locale)
      },
      landmarkLabel: (id: string) => landmarkLabel(id, locale),
    }),
    [locale],
  )
}
