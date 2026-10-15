export type ZoneType =
  | 'downtown'
  | 'residential'
  | 'industrial'
  | 'mixed'
  | 'waterfront'
  | 'park'

export function getZone(gx: number, gz: number): ZoneType {
  if (gz === 0) return 'waterfront'
  if (gz === 1 && (gx === 0 || gx === 1 || gx === 5 || gx === 6)) return 'park'
  if (gx === 0 || gx === 6) return 'industrial'
  if (gx >= 2 && gx <= 4 && gz >= 4) return 'downtown'
  if (gx === 3 && gz >= 2) return 'downtown'
  if (gx === 1 || gx === 5) return 'mixed'
  if (gz <= 2) return 'waterfront'
  return 'residential'
}

export function isBoulevardColumn(gx: number): boolean {
  return gx === 3
}

export function isBoulevardRow(gz: number): boolean {
  return gz === 3
}
