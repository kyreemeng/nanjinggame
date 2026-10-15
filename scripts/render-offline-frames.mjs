/**
 * Offline 1920x1080 stills when browser WebGL is unavailable.
 * Run: node scripts/render-offline-frames.mjs
 */
import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const OUT = '/opt/cursor/artifacts/ashline-marketing'

async function tryHeadlessGl() {
  try {
    const createGL = require('gl')
    const THREE = require('three')
    const { PNG } = require('pngjs')

    await mkdir(OUT, { recursive: true })

    const width = 1920
    const height = 1080
    const gl = createGL(width, height, { preserveDrawingBuffer: true })
    if (!gl) throw new Error('gl context null')

    const renderer = new THREE.WebGLRenderer({
      canvas: { width, height, style: {}, addEventListener() {}, removeEventListener() {}, clientHeight: height, clientWidth: width },
      context: gl,
      antialias: true,
    })
    renderer.setSize(width, height, false)
    renderer.setClearColor(0x7eb3e8)

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x9eb9d0, 40, 200)
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500)

    const sun = new THREE.DirectionalLight(0xfff0cc, 1.4)
    sun.position.set(60, 90, 40)
    scene.add(sun)
    scene.add(new THREE.HemisphereLight(0xe8f2ff, 0x5a6d52, 0.55))

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.95 }),
    )
    ground.rotation.x = -Math.PI / 2
    scene.add(ground)

    const buildingMat = new THREE.MeshStandardMaterial({ color: 0x5a6472, roughness: 0.85 })
    for (let i = 0; i < 24; i++) {
      const h = 8 + Math.random() * 22
      const w = 10 + Math.random() * 12
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * 0.9), buildingMat)
      const angle = (i / 24) * Math.PI * 2
      mesh.position.set(Math.cos(angle) * (55 + (i % 3) * 8), h / 2, Math.sin(angle) * (55 + (i % 3) * 8))
      scene.add(mesh)
    }

    const car = new THREE.Group()
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 0.55, 4.1),
      new THREE.MeshStandardMaterial({ color: 0xc43c3c, metalness: 0.4, roughness: 0.35 }),
    )
    body.position.y = 0.45
    car.add(body)
    car.position.set(0, 0, 0)
    scene.add(car)

    const player = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.32, 0.75, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x2f6f9f }),
    )
    player.position.set(-6, 1.05, 4)
    scene.add(player)

    const shots = [
      {
        name: '02-boulevard-explore',
        caption: '林荫大道与城市天际 — 离线渲染预览（港区尺度）',
        cam: { x: 35, y: 28, z: 45, look: [0, 5, 0] },
      },
      {
        name: '03-street-on-foot',
        caption: '第三人称街道探索 — 离线渲染预览',
        cam: { x: -10, y: 4, z: 12, look: [-6, 1.2, 4] },
      },
      {
        name: '04-driving-red-coupe',
        caption: '红色轿跑 — 离线渲染预览',
        cam: { x: 8, y: 3.5, z: 10, look: [0, 0.8, 0] },
      },
      {
        name: '05-hud-minimap',
        caption: '城市街道与车辆 — 离线渲染预览（HUD 见实机截图）',
        cam: { x: 18, y: 12, z: 22, look: [0, 2, 0] },
      },
    ]

    const writePng = (name, caption) =>
      new Promise((resolve, reject) => {
        const pixels = new Uint8Array(width * height * 4)
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
        const png = new PNG({ width, height })
        for (let y = 0; y < height; y++) {
          const srcY = height - 1 - y
          for (let x = 0; x < width; x++) {
            const src = (srcY * width + x) * 4
            const dst = (y * width + x) * 4
            png.data[dst] = pixels[src]
            png.data[dst + 1] = pixels[src + 1]
            png.data[dst + 2] = pixels[src + 2]
            png.data[dst + 3] = 255
          }
        }
        const file = path.join(OUT, `${name}.png`)
        png.pack().pipe(createWriteStream(file)).on('finish', () => {
          console.log(`CAPTURED|${file}|${caption}`)
          resolve()
        }).on('error', reject)
      })

    for (const s of shots) {
      camera.position.set(s.cam.x, s.cam.y, s.cam.z)
      camera.lookAt(...s.cam.look)
      renderer.render(scene, camera)
      await writePng(s.name, s.caption)
    }

    return true
  } catch (e) {
    console.log('OFFLINE_GL|fail|' + (e?.message || e))
    return false
  }
}

tryHeadlessGl().then((ok) => {
  if (!ok) process.exit(2)
})
