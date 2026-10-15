import { useGameStore } from '../../game/store/gameStore'
import { ACTIVE_MAP_BOUNDS } from '../../game/world/activeMapBounds'
import { playMenuClick } from '../menus/playClick'

export function Minimap() {
  const x = useGameStore((s) => s.playerX)
  const z = useGameStore((s) => s.playerZ)
  const yaw = useGameStore((s) => s.compassDeg)
  const markers = useGameStore((s) => s.mapMarkers)
  const setMapOpen = useGameStore((s) => s.setMapOpen)

  const size = 120
  const bounds = ACTIVE_MAP_BOUNDS

  return (
    <div
      className="minimap minimap-clickable"
      onClick={() => {
        playMenuClick()
        setMapOpen(true)
        if (document.pointerLockElement) document.exitPointerLock()
      }}
      title="Open district map"
    >
      <div className="minimap-grid" style={{ width: size, height: size }}>
        {markers.map((m, i) => {
          const px = ((m.x - bounds.minX) / bounds.width) * size
          const py = ((m.z - bounds.minZ) / bounds.depth) * size
          return (
            <div
              key={`${m.x}-${m.z}-${i}`}
              className="minimap-marker"
              style={{ left: px, top: py }}
              title={m.label}
            />
          )
        })}
        <div
          className="minimap-player"
          style={{
            left: ((x - bounds.minX) / bounds.width) * size,
            top: ((z - bounds.minZ) / bounds.depth) * size,
            transform: `translate(-50%, -50%) rotate(${yaw}deg)`,
          }}
        />
      </div>
      <span className="minimap-label">District</span>
    </div>
  )
}
