import type { NanjingMapBundle } from './types'

const BUNDLE_URL = '/map-data/nanjing-core/core.bundle.json'

let cached: NanjingMapBundle | null = null

export async function loadNanjingMapBundle(): Promise<NanjingMapBundle> {
  if (cached) return cached
  const res = await fetch(BUNDLE_URL)
  if (!res.ok) {
    throw new Error(
      `Nanjing map bundle missing (${BUNDLE_URL}). Run: node scripts/build-nanjing-map-data.mjs`,
    )
  }
  cached = (await res.json()) as NanjingMapBundle
  return cached
}

export function getCachedNanjingMap(): NanjingMapBundle | null {
  return cached
}
