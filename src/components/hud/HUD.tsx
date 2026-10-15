import { useGameStore } from '../../game/store/gameStore'
import { Minimap } from './Minimap'
import { MissionToast } from './MissionToast'

export function HUD() {
  const health = useGameStore((s) => s.health)
  const money = useGameStore((s) => s.money)
  const objective = useGameStore((s) => s.objective)
  const speed = useGameStore((s) => s.speedKmh)
  const fps = useGameStore((s) => s.fps)
  const compass = useGameStore((s) => s.compassDeg)
  const driving = useGameStore((s) => s.driving)
  const canEnter = useGameStore((s) => s.canEnterVehicle)
  const timer = useGameStore((s) => s.missionTimerSec)
  const wanted = useGameStore((s) => s.wantedStars)
  const npcPrompt = useGameStore((s) => s.npcPrompt)

  const heading =
    compass < 22.5 || compass >= 337.5
      ? 'N'
      : compass < 67.5
        ? 'NE'
        : compass < 112.5
          ? 'E'
          : compass < 157.5
            ? 'SE'
            : compass < 202.5
              ? 'S'
              : compass < 247.5
                ? 'SW'
                : compass < 292.5
                  ? 'W'
                  : 'NW'

  return (
    <div className="hud">
      <MissionToast />
      <div className="hud-top">
        <Minimap />
        <div className="compass">
          <span className="compass-deg">{Math.round(compass)}°</span>
          <span className="compass-cardinal">{heading}</span>
        </div>
        {timer !== null && <div className="mission-timer">{timer}s</div>}
        <div className="wanted" aria-label={`Heat level ${wanted}`}>
          {'★'.repeat(wanted)}
          <span className="wanted-dim">{'★'.repeat(5 - wanted)}</span>
        </div>
        <div className="fps">{fps} FPS</div>
      </div>

      <div className="hud-bottom">
        <div className="stat-row">
          <span>Health</span>
          <div className="bar">
            <div className="bar-fill health" style={{ width: `${health}%` }} />
          </div>
          <span>{health}</span>
        </div>
        <div className="stat-row">
          <span>Credits</span>
          <strong>${money}</strong>
        </div>
        <div className="objective">
          <span>Objective</span>
          <p>{objective}</p>
        </div>
        {driving ? (
          <div className="speed-readout">{Math.round(speed)} km/h</div>
        ) : canEnter ? (
          <div className="prompt">Press E to enter vehicle</div>
        ) : npcPrompt ? (
          <div className="prompt">{npcPrompt} — Press E to chat</div>
        ) : null}
      </div>
    </div>
  )
}
