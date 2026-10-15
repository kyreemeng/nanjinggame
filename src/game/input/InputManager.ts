export class InputManager {
  private keys = new Set<string>()
  private mouseDx = 0
  private mouseDy = 0
  private pointerLocked = false
  private enabled = true

  attach(canvas: HTMLCanvasElement): () => void {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!this.enabled) return
      if (e.code === 'Tab') e.preventDefault()
      this.keys.add(e.code)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      this.keys.delete(e.code)
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!this.enabled || !this.pointerLocked) return
      this.mouseDx += e.movementX
      this.mouseDy += e.movementY
    }
    const onPointerLockChange = () => {
      this.pointerLocked = document.pointerLockElement === canvas
      if (!this.pointerLocked) {
        this.clearMovement()
      }
    }
    const onBlur = () => this.releaseAll()
    const onVisibility = () => {
      if (document.hidden) this.releaseAll()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerlockchange', onPointerLockChange)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (!enabled) this.releaseAll()
  }

  releaseAll(): void {
    this.keys.clear()
    this.clearMovement()
  }

  clearMovement(): void {
    this.mouseDx = 0
    this.mouseDy = 0
  }

  consumeMouseDelta(): { dx: number; dy: number } {
    const delta = { dx: this.mouseDx, dy: this.mouseDy }
    this.mouseDx = 0
    this.mouseDy = 0
    return delta
  }

  isDown(code: string): boolean {
    return this.keys.has(code)
  }

  wasPressed(code: string): boolean {
    return this.keys.has(code)
  }

  requestPointerLock(canvas: HTMLCanvasElement): void {
    if (document.pointerLockElement !== canvas) {
      canvas.requestPointerLock()
    }
  }

  exitPointerLock(): void {
    if (document.pointerLockElement) {
      document.exitPointerLock()
    }
  }

  get isPointerLocked(): boolean {
    return this.pointerLocked
  }
}
