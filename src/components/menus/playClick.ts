import { getAudioManager } from '../../game/audio/AudioManager'

export function playMenuClick(): void {
  getAudioManager().playUiClick()
}
