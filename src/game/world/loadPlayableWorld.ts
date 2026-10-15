import * as THREE from 'three'
import { loadNanjingMapBundle } from '../../map-data/loadNanjingMap'
import type { ColliderBox } from '../physics/PhysicsWorld'
import { WORLD_SIZE } from '../constants'
import { buildCity } from './CityBuilder'
import { buildNanjingWorld, type NanjingWorldResult } from './nanjing/NanjingWorldBuilder'
import type { WorldMode } from './worldMode'

export interface PlayableWorldLoadResult {
  group: THREE.Group
  colliders: ColliderBox[]
  spawnPlayer: THREE.Vector3
  spawnVehicle: THREE.Vector3
  spawnVehicleYaw: number
  ground: { centerX: number; centerZ: number; width: number; depth: number }
  mapAnchors: { x: number; z: number; label: string }[]
  mode: WorldMode
}

export async function loadPlayableWorld(mode: WorldMode): Promise<PlayableWorldLoadResult> {
  if (mode === 'harbor') {
    const city = buildCity()
    return {
      group: city.group,
      colliders: city.colliders,
      spawnPlayer: city.spawnPlayer,
      spawnVehicle: city.spawnVehicle,
      spawnVehicleYaw: 0,
      ground: { centerX: 0, centerZ: 0, width: WORLD_SIZE, depth: WORLD_SIZE },
      mapAnchors: [],
      mode: 'harbor',
    }
  }

  const bundle = await loadNanjingMapBundle()
  const city: NanjingWorldResult = buildNanjingWorld(bundle)
  return {
    group: city.group,
    colliders: city.colliders,
    spawnPlayer: city.spawnPlayer,
    spawnVehicle: city.spawnVehicle,
    spawnVehicleYaw: city.spawnVehicleYaw,
    ground: {
      centerX: city.bounds.centerX,
      centerZ: city.bounds.centerZ,
      width: city.bounds.width + 48,
      depth: city.bounds.depth + 48,
    },
    mapAnchors: city.mapAnchors,
    mode: 'nanjing',
  }
}
