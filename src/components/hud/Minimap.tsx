import { useGameStore } from '../../game/store/gameStore'
import { WORLD_SIZE } from '../../game/constants'

export function Minimap() {
  const x = useGameStore((s) => s.playerX)
  const z = useGameStore((s) => s.playerZ)
  const yaw = useGameStore((s) => s.compassDeg)
  const markers = useGameStore((s) => s.mapMarkers)

  const size = 120
  const half = WORLD_SIZE / 2

  return (
    <div className="minimap">
      <div className="minimap-grid" style={{ width: size, height: size }}>
        {markers.map((m, i) => {
          const px = ((m.x + half) / WORLD_SIZE) * size
          const py = ((m.z + half) / WORLD_SIZE) * size
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
            left: ((x + half) / WORLD_SIZE) * size,
            top: ((z + half) / WORLD_SIZE) * size,
            transform: `translate(-50%, -50%) rotate(${yaw}deg)`,
          }}
        />
      </div>
      <span className="minimap-label">District</span>
    </div>
  )
}
