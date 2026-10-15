import { useSettingsStore } from '../../game/store/settingsStore'
import { useGameStore } from '../../game/store/gameStore'
import { formatKeyCode } from '../../game/input/actions'
import { useTranslation } from '../../i18n'
import { Minimap } from './Minimap'
import { MissionToast } from './MissionToast'
import { Speedometer } from './Speedometer'

export function HUD() {
  const { t } = useTranslation()
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
  const mapKey = useSettingsStore((s) => formatKeyCode(s.bindings.map))

  const heading =
    compass < 22.5 || compass >= 337.5
      ? t('compass.N')
      : compass < 67.5
        ? t('compass.NE')
        : compass < 112.5
          ? t('compass.E')
          : compass < 157.5
            ? t('compass.SE')
            : compass < 202.5
              ? t('compass.S')
              : compass < 247.5
                ? t('compass.SW')
                : compass < 292.5
                  ? t('compass.W')
                  : t('compass.NW')

  return (
    <div className="hud hud-tech">
      <MissionToast />
      <div className="hud-top">
        <Minimap />
        <div className="compass">
          <span className="compass-deg">{Math.round(compass)}°</span>
          <span className="compass-cardinal">{heading}</span>
        </div>
        {timer !== null && <div className="mission-timer">{timer}s</div>}
        <div className="wanted" aria-label={`Heat level ${wanted}`}>
          <span className="wanted-label">{t('hud.heat')}</span>
          {'★'.repeat(wanted)}
          <span className="wanted-dim">{'★'.repeat(5 - wanted)}</span>
        </div>
        <div className="fps">{fps} {t('hud.fps')}</div>
      </div>

      <div className="hud-right">
        {driving && <Speedometer speedKmh={speed} />}
      </div>

      <div className="hud-bottom panel-tech">
        <div className="hud-stats-row">
          <div className="stat-chip">
            <span className="chip-label">{t('hud.hp')}</span>
            <div className="bar">
              <div className="bar-fill health" style={{ width: `${health}%` }} />
            </div>
            <span>{health}</span>
          </div>
          <div className="stat-chip money-chip">
            <span className="chip-label">{t('hud.money')}</span>
            <strong>${money}</strong>
          </div>
        </div>
        <div className="objective">
          <span>{t('hud.objective')}</span>
          <p>{objective}</p>
        </div>
        {driving ? null : canEnter ? (
          <div className="prompt">{t('hud.enterVehicle')}</div>
        ) : npcPrompt ? (
          <div className="prompt">{npcPrompt} {t('hud.chatPrompt')}</div>
        ) : (
          <div className="prompt subtle">{t('hud.mapPrompt', { key: mapKey })}</div>
        )}
      </div>
    </div>
  )
}
