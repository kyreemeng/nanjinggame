import * as THREE from 'three'
import { InstancedLayer } from './instancing'
import { getLampGlowMaterial, getMetalDarkMaterial, getRoadMarkingMaterial } from './sharedMaterials'

export interface StreetPropLayers {
  lightPoles: InstancedLayer
  lightLamps: InstancedLayer
  trees: InstancedLayer
  benches: InstancedLayer
  trafficLights: InstancedLayer
  dashes: InstancedLayer
}

export function createStreetPropLayers(): StreetPropLayers {
  return {
    lightPoles: new InstancedLayer(
      new THREE.CylinderGeometry(0.07, 0.09, 5.1, 6),
      getMetalDarkMaterial(),
      240,
      true,
    ),
    lightLamps: new InstancedLayer(
      new THREE.SphereGeometry(0.16, 6, 6),
      getLampGlowMaterial(),
      240,
      false,
    ),
    trees: new InstancedLayer(
      new THREE.ConeGeometry(0.85, 2.3, 7),
      new THREE.MeshStandardMaterial({ color: '#3d7348', roughness: 0.88 }),
      200,
      true,
    ),
    benches: new InstancedLayer(
      new THREE.BoxGeometry(1.4, 0.45, 0.45),
      new THREE.MeshStandardMaterial({ color: '#4a4035', roughness: 0.9 }),
      90,
      false,
    ),
    trafficLights: new InstancedLayer(
      new THREE.BoxGeometry(0.42, 1.25, 0.32),
      getMetalDarkMaterial(),
      56,
      true,
    ),
    dashes: new InstancedLayer(
      new THREE.BoxGeometry(0.55, 0.03, 2.2),
      getRoadMarkingMaterial(),
      1400,
      false,
    ),
  }
}

export function addStreetLight(layers: StreetPropLayers, x: number, z: number): void {
  layers.lightPoles.place(x, 2.55, z)
  layers.lightLamps.place(x + 0.95, 5.05, z)
}

export function addTree(layers: StreetPropLayers, x: number, z: number, scale = 1): void {
  layers.trees.place(x, 2.2, z, Math.random() * Math.PI, scale, scale, scale)
}

export function addBench(layers: StreetPropLayers, x: number, z: number, rot: number): void {
  layers.benches.place(x, 0.45, z, rot)
}

export function addTrafficLight(layers: StreetPropLayers, x: number, z: number, rot: number): void {
  layers.trafficLights.place(x, 4.35, z, rot)
}

export function addRoadDash(layers: StreetPropLayers, x: number, z: number, alongX: boolean): void {
  layers.dashes.place(x, 0.05, z, alongX ? 0 : Math.PI / 2)
}

export function finalizeStreetPropMeshes(layers: StreetPropLayers): THREE.InstancedMesh[] {
  const meshes: THREE.InstancedMesh[] = []
  for (const layer of Object.values(layers)) {
    layer.finalize()
    meshes.push(layer.mesh)
  }
  return meshes
}
