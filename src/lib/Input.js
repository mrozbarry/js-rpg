const mappings = ["up", "left", "down", "right"]

export default class Input {
  static presets = {
    wasd: {
      up: 87,
      left: 65,
      down: 83,
      right: 68,
      action: 69,
    },
    vim: {
      up: 75,
      left: 72,
      down: 74,
      right: 76,
      action: 188,
    }
  }

  constructor(preset = "wasd") {
    this.mapKeyCodes(Input.presets[preset] || Input.presets.wasd)
    this.reset()
    this.state = { up: false, left: false, down: false, right: false }

    this.keyDown = this.keyDown.bind(this)
    this.keyUp = this.keyUp.bind(this)
    this.reset = this.reset.bind(this)

    this._isBound = false
  }

  bind() {
    if (this._isBound) return

    document.addEventListener("keydown", this.keyDown, false)
    document.addEventListener("keyup", this.keyUp, false)
    document.addEventListener("blur", this.reset, false)

    this._isBound = true
  }

  unbind() {
    if (!this._isBound) return

    document.removeEventListener("keydown", this.keyDown, false)
    document.removeEventListener("keyup", this.keyUp, false)
    document.removeEventListener("blur", this.reset, false)

    this._isBound = false
  }

  mapKeyCodes({ up, down, left, right, action }) {
    this.keyCodes = { up, down, left, right, action }
  }

  keyDown(e) {
    return mappings.map((dir) => {
      if (e.which === this.keyCodes[dir]) {
        this.state = { ...this.state, [dir]: true }
        return true
      }
      return false
    }).some((a) => a)
  }

  keyUp(e) {
    return mappings.map((dir) => {
      if (e.which === this.keyCodes[dir]) {
        this.state = { ...this.state, [dir]: false }
        return true
      }
      return false
    }).some((a) => a)
  }

  reset() {
    mappings.forEach((dir) => {
      this.state = { ...this.state, [dir]: false }
    })
  }

  hasActiveKeys() {
    return mappings.some((dir) => this.state[dir])
  }
}
