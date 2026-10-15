import * as THREE from 'three'
import type { GraphicsPreset } from '../../storage/settings'
import type { AtmosphereHandles } from '../world/atmosphere'
import { WORLD_SIZE } from '../constants'

export interface GraphicsTargets {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  atmosphere: AtmosphereHandles
  camera: THREE.PerspectiveCamera
}

export function applyGraphicsPreset(targets: GraphicsTargets, preset: GraphicsPreset): void {
  const { renderer, scene, atmosphere, camera } = targets

  switch (preset) {
    case 'low':
      renderer.setPixelRatio(1)
      renderer.shadowMap.enabled = false
      camera.far = 260
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.near = 40
        scene.fog.far = 130
      }
      atmosphere.sun.castShadow = false
      break
    case 'medium':
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFShadowMap
      atmosphere.sun.castShadow = true
      atmosphere.sun.shadow.mapSize.set(1024, 1024)
      camera.far = 380
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.near = 50
        scene.fog.far = 185
      }
      break
    case 'high':
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      atmosphere.sun.castShadow = true
      atmosphere.sun.shadow.mapSize.set(2048, 2048)
      camera.far = 480
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.near = 55
        scene.fog.far = 210
      }
      break
    default:
      break
  }
  camera.updateProjectionMatrix()
  void WORLD_SIZE
}
