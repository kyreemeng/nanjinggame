import type { ReactNode } from 'react'
import { playMenuClick } from './playClick'

interface MenuShellProps {
  title: string
  subtitle?: string
  onBack?: () => void
  children: ReactNode
  wide?: boolean
}

export function MenuShell({ title, subtitle, onBack, children, wide }: MenuShellProps) {
  return (
    <div className="menu-overlay">
      <div className={`menu-card menu-card-tech ${wide ? 'wide' : ''}`}>
        {onBack && (
          <button
            type="button"
            className="menu-back"
            onClick={() => {
              playMenuClick()
              onBack()
            }}
          >
            ← Back
          </button>
        )}
        <p className="menu-eyebrow">Harbor Row</p>
        <h2>{title}</h2>
        {subtitle && <p className="menu-sub">{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}
