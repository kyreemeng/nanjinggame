import { useGameStore } from '../../game/store/gameStore'
import { WORLD_SIZE } from '../../game/constants'

export function Minimap() {
  const x = useGameStore((s) => s.playerX)
  const z = useGameStore((s) => s.playerZ)
  const yaw = useGameStore((s) => s.compassDeg)

  const size = 120
  const half = WORLD_SIZE / 2
  const px = ((x + half) / WORLD_SIZE) * size
  const py = ((z + half) / WORLD_SIZE) * size

  return (
    <div className="minimap">
      <div className="minimap-grid" style={{ width: size, height: size }}>
        <div
          className="minimap-player"
          style={{
            left: px,
            top: py,
            transform: `translate(-50%, -50%) rotate(${yaw}deg)`,
          }}
        />
      </div>
      <span className="minimap-label">District</span>
    </div>
  )
}
