export type WorldMode = 'nanjing' | 'harbor'

/**
 * Default: Nanjing verified core. Legacy Harbor Row procedural city only via `?world=harbor` (dev).
 */
export function resolveWorldMode(): WorldMode {
  if (typeof window === 'undefined') return 'nanjing'
  const value = new URLSearchParams(window.location.search).get('world')
  return value === 'harbor' ? 'harbor' : 'nanjing'
}

export function isHarborLegacyEnabled(): boolean {
  return resolveWorldMode() === 'harbor'
}
