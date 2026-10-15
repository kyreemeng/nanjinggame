export type GameAction =
  | 'forward'
  | 'back'
  | 'left'
  | 'right'
  | 'run'
  | 'jump'
  | 'interact'
  | 'brake'
  | 'accelerate'
  | 'reverse'
  | 'steerLeft'
  | 'steerRight'
  | 'map'

export const ACTION_LABELS: Record<GameAction, string> = {
  forward: 'Move forward',
  back: 'Move back',
  left: 'Move left',
  right: 'Move right',
  run: 'Run',
  jump: 'Jump / brake (foot)',
  interact: 'Interact',
  brake: 'Brake (vehicle)',
  accelerate: 'Accelerate',
  reverse: 'Reverse',
  steerLeft: 'Steer left',
  steerRight: 'Steer right',
  map: 'Open map',
}

export const DEFAULT_BINDINGS: Record<GameAction, string> = {
  forward: 'KeyW',
  back: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  run: 'ShiftLeft',
  jump: 'Space',
  interact: 'KeyE',
  brake: 'Space',
  accelerate: 'KeyW',
  reverse: 'KeyS',
  steerLeft: 'KeyA',
  steerRight: 'KeyD',
  map: 'KeyM',
}

export function formatKeyCode(code: string): string {
  if (code.startsWith('Key')) return code.slice(3)
  if (code.startsWith('Arrow')) return code.slice(5)
  if (code === 'Space') return 'Space'
  if (code.startsWith('Shift')) return 'Shift'
  return code
}
