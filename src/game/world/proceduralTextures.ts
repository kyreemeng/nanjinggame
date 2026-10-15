import * as THREE from 'three'

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

export function createAsphaltTexture(): THREE.CanvasTexture {
  const c = makeCanvas(256, 256)
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#2a2d33'
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 256
    const y = Math.random() * 256
    const g = 35 + Math.random() * 25
    ctx.fillStyle = `rgb(${g},${g + 2},${g + 5})`
    ctx.fillRect(x, y, 1, 1)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(24, 24)
  return tex
}

export function createConcreteTexture(): THREE.CanvasTexture {
  const c = makeCanvas(128, 128)
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#8d9198'
  ctx.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 800; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`
    ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(8, 8)
  return tex
}

export function createFacadeTexture(tint: string, windows: boolean): THREE.CanvasTexture {
  const c = makeCanvas(64, 128)
  const ctx = c.getContext('2d')!
  ctx.fillStyle = tint
  ctx.fillRect(0, 0, 64, 128)
  if (windows) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 3; col++) {
        const lit = Math.random() > 0.35
        ctx.fillStyle = lit ? '#ffe9a8' : '#1a2230'
        ctx.fillRect(8 + col * 18, 10 + row * 14, 10, 8)
      }
    }
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}
