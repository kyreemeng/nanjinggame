import * as THREE from 'three'
import { WORLD_SIZE } from '../constants'

export interface AtmosphereHandles {
  sky: THREE.Mesh
  sun: THREE.DirectionalLight
  hemi: THREE.HemisphereLight
  ambient: THREE.AmbientLight
}

export function createAtmosphere(scene: THREE.Scene): AtmosphereHandles {
  scene.background = new THREE.Color('#7eb3e8')

  const skyGeo = new THREE.SphereGeometry(WORLD_SIZE * 0.95, 32, 18)
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color('#4a8fd4') },
      bottomColor: { value: new THREE.Color('#d8e8f8') },
      offset: { value: 8 },
      exponent: { value: 0.55 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
  })
  const sky = new THREE.Mesh(skyGeo, skyMat)
  scene.add(sky)

  scene.fog = new THREE.Fog('#9eb9d0', 55, 210)

  const hemi = new THREE.HemisphereLight('#e8f2ff', '#5a6d52', 0.62)
  scene.add(hemi)

  const ambient = new THREE.AmbientLight('#c8d8ec', 0.28)
  scene.add(ambient)

  const sun = new THREE.DirectionalLight('#fff0cc', 1.55)
  sun.position.set(85, 120, 45)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.near = 10
  sun.shadow.camera.far = 280
  sun.shadow.camera.left = -70
  sun.shadow.camera.right = 70
  sun.shadow.camera.top = 70
  sun.shadow.camera.bottom = -70
  sun.shadow.bias = -0.00025
  scene.add(sun)

  return { sky, sun, hemi, ambient }
}

export function updateSunShadowFocus(
  sun: THREE.DirectionalLight,
  target: THREE.Vector3,
): void {
  sun.position.set(target.x + 75, target.y + 110, target.z + 40)
  sun.target.position.copy(target)
  sun.target.updateMatrixWorld()
}
