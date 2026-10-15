import { ACTIVE_WORLD_BBOX, worldBoundsFromBbox } from '../../map-data/coordinate-system'

/** Map / minimap extent for the active Nanjing verified-core world. */
export const ACTIVE_MAP_BOUNDS = worldBoundsFromBbox(ACTIVE_WORLD_BBOX)
