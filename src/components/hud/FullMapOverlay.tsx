import { useEffect, useRef } from 'react'
import { useGameStore } from '../../game/store/gameStore'
import { useTranslation, type MessageKey } from '../../i18n'
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
  const { t } = useTranslation()
  const open = useGameStore((s) => s.mapOpen)
  const setMapOpen = useGameStore((s) => s.setMapOpen)
  const playerX = useGameStore((s) => s.playerX)
  const playerZ = useGameStore((s) => s.playerZ)
  const compass = useGameStore((s) => s.compassDeg)
  const markers = useGameStore((s) => s.mapMarkers)
  const anchors = useGameStore((s) => s.mapAnchors)
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

    for (const m of anchors) {
      const p = worldToMapPx(m.x, m.z, w)
      ctx.fillStyle = '#7ec8ff'
      ctx.beginPath()
      ctx.arc(p.px, p.py, 5, 0, Math.PI * 2)
      ctx.fill()
      if (m.label) {
        ctx.fillStyle = 'rgba(255,255,255,0.75)'
        ctx.font = '10px system-ui'
        ctx.fillText(m.label, p.px + 7, p.py + 3)
      }
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

    const footer = t('map.footer', { district: t('brand.district'), size: WORLD_SIZE })
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '11px system-ui'
    ctx.fillText(footer, 12, h - 12)
  }, [open, playerX, playerZ, compass, markers, anchors, t])

  if (!open) return null

  return (
    <div className="map-overlay">
      <div className="map-panel">
        <header className="map-header">
          <h2>{t('map.title')}</h2>
          <button
            type="button"
            className="menu-btn compact"
            onClick={() => {
              playMenuClick()
              setMapOpen(false)
            }}
          >
            {t('map.close')}
          </button>
        </header>
        <canvas ref={canvasRef} className="map-canvas" />
        <div className="map-legend">
          {mapLegend().map((item) => (
            <span key={item.zone}>
              <i style={{ background: getZoneColor(item.zone) }} />
              {t(`map.zone.${item.zone}` as MessageKey)}
            </span>
          ))}
          <span><i className="anchor-sample" /> {t('map.anchors')}</span>
          <span><i className="marker-sample" /> {t('map.objective')}</span>
        </div>
      </div>
    </div>
  )
}
