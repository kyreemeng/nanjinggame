import { useEffect, useRef } from 'react'
import { useGameStore } from '../../game/store/gameStore'
import {
  buildMapRoads,
  buildMapZones,
  getZoneColor,
  mapLegend,
  worldToMapPx,
  WORLD_SIZE,
} from '../../game/world/mapLayout'
import { playMenuClick } from '../menus/playClick'

export function FullMapOverlay() {
  const open = useGameStore((s) => s.mapOpen)
  const setMapOpen = useGameStore((s) => s.setMapOpen)
  const playerX = useGameStore((s) => s.playerX)
  const playerZ = useGameStore((s) => s.playerZ)
  const compass = useGameStore((s) => s.compassDeg)
  const markers = useGameStore((s) => s.mapMarkers)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    ctx.fillStyle = '#0a121c'
    ctx.fillRect(0, 0, w, h)

    const zones = buildMapZones()
    for (const z of zones) {
      const tl = worldToMapPx(z.x, z.z, w)
      const br = worldToMapPx(z.x + z.w, z.z + z.h, w)
      ctx.fillStyle = getZoneColor(z.zone)
      ctx.globalAlpha = 0.55
      ctx.fillRect(tl.px, tl.py, br.px - tl.px, br.py - tl.py)
      ctx.globalAlpha = 1
    }

    const roads = buildMapRoads()
    for (const r of roads) {
      const a = worldToMapPx(r.x1, r.z1, w)
      const b = worldToMapPx(r.x2, r.z2, w)
      ctx.strokeStyle = r.major ? '#8a9aaa' : '#4a5560'
      ctx.lineWidth = r.major ? 3 : 1.5
      ctx.beginPath()
      ctx.moveTo(a.px, a.py)
      ctx.lineTo(b.px, b.py)
      ctx.stroke()
    }

    for (const m of markers) {
      const p = worldToMapPx(m.x, m.z, w)
      ctx.fillStyle = '#ffc857'
      ctx.beginPath()
      ctx.arc(p.px, p.py, 4, 0, Math.PI * 2)
      ctx.fill()
    }

    const pp = worldToMapPx(playerX, playerZ, w)
    ctx.save()
    ctx.translate(pp.px, pp.py)
    ctx.rotate((compass * Math.PI) / 180)
    ctx.fillStyle = '#5fd4ff'
    ctx.beginPath()
    ctx.moveTo(0, -8)
    ctx.lineTo(6, 8)
    ctx.lineTo(-6, 8)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '11px system-ui'
    ctx.fillText(`Harbor Row · ${WORLD_SIZE}m`, 12, h - 12)
  }, [open, playerX, playerZ, compass, markers])

  if (!open) return null

  return (
    <div className="map-overlay">
      <div className="map-panel">
        <header className="map-header">
          <h2>District Map</h2>
          <button
            type="button"
            className="menu-btn compact"
            onClick={() => {
              playMenuClick()
              setMapOpen(false)
            }}
          >
            Close (M)
          </button>
        </header>
        <canvas ref={canvasRef} className="map-canvas" />
        <div className="map-legend">
          {mapLegend().map((item) => (
            <span key={item.zone}>
              <i style={{ background: getZoneColor(item.zone) }} />
              {item.label}
            </span>
          ))}
          <span><i className="marker-sample" /> Objective</span>
        </div>
      </div>
    </div>
  )
}
