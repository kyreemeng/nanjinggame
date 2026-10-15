import * as THREE from 'three'
import { createAsphaltTexture, createConcreteTexture } from './proceduralTextures'

let asphalt: THREE.MeshStandardMaterial | null = null
let concrete: THREE.MeshStandardMaterial | null = null
let roadMarking: THREE.MeshStandardMaterial | null = null
let metalDark: THREE.MeshStandardMaterial | null = null
let lampGlow: THREE.MeshStandardMaterial | null = null

export function getAsphaltMaterial(): THREE.MeshStandardMaterial {
  if (!asphalt) {
    asphalt = new THREE.MeshStandardMaterial({
      map: createAsphaltTexture(),
      roughness: 0.94,
      metalness: 0.02,
    })
  }
  return asphalt
}

export function getConcreteMaterial(): THREE.MeshStandardMaterial {
  if (!concrete) {
    concrete = new THREE.MeshStandardMaterial({
      map: createConcreteTexture(),
      roughness: 0.9,
      metalness: 0.02,
    })
  }
  return concrete
}

export function getRoadMarkingMaterial(): THREE.MeshStandardMaterial {
  if (!roadMarking) {
    roadMarking = new THREE.MeshStandardMaterial({
      color: '#e8edf2',
      roughness: 0.85,
      metalness: 0,
    })
  }
  return roadMarking
}

export function getMetalDarkMaterial(): THREE.MeshStandardMaterial {
  if (!metalDark) {
    metalDark = new THREE.MeshStandardMaterial({
      color: '#2a3038',
      roughness: 0.45,
      metalness: 0.55,
    })
  }
  return metalDark
}

export function getLampGlowMaterial(): THREE.MeshStandardMaterial {
  if (!lampGlow) {
    lampGlow = new THREE.MeshStandardMaterial({
      color: '#fff4d0',
      emissive: '#ffdc7a',
      emissiveIntensity: 0.9,
      roughness: 0.35,
    })
  }
  return lampGlow
}
