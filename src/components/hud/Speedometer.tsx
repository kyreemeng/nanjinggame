import { useTranslation } from '../../i18n'

interface SpeedometerProps {
  speedKmh: number
  max?: number
}

export function Speedometer({ speedKmh, max = 120 }: SpeedometerProps) {
  const { t } = useTranslation()
  const pct = Math.min(1, speedKmh / max)
  const angle = -120 + pct * 240
  const rad = (angle * Math.PI) / 180
  const nx = 50 + Math.sin(rad) * 38
  const ny = 52 - Math.cos(rad) * 38

  return (
    <div
      className="speedometer"
      aria-label={t('hud.speedAria', { speed: Math.round(speedKmh) })}
    >
      <svg viewBox="0 0 100 60" className="speed-svg">
        <path d="M 12 52 A 38 38 0 1 1 88 52" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
        <path
          d="M 12 52 A 38 38 0 1 1 88 52"
          fill="none"
          stroke="#5fd4ff"
          strokeWidth="6"
          strokeDasharray={`${pct * 120} 120`}
        />
        <line x1="50" y1="52" x2={nx} y2={ny} stroke="#e8f4ff" strokeWidth="2" />
        <circle cx="50" cy="52" r="3" fill="#5fd4ff" />
      </svg>
      <div className="speed-value">
        <strong>{Math.round(speedKmh)}</strong>
        <span>{t('hud.speedUnit')}</span>
      </div>
    </div>
  )
}
