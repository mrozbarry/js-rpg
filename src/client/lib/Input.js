const mappings = ["up", "left", "down", "right", "action"]

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
    },
    arrows: {
      up: 38,
      left: 37,
      down: 40,
      right: 39,
      action: 32
    }
  }


  constructor () {
    this.keyDown = this.keyDown.bind(this)
    this.keyUp = this.keyUp.bind(this)
    this.reset = this.reset.bind(this)

    this.onChange = (() => {})

    this.keyCodes = {
      up: null,
      left: null,
      down: null,
      right: null,
      action: null,
    },

    document.addEventListener("keydown", this.keyDown, false)
    document.addEventListener("keyup", this.keyUp, false)
    document.addEventListener("blur", this.reset, false)

    this.reset()
  }


  use ({ up, down, left, right, action }) {
    this.keyCodes = { up, down, left, right, action }
  }


  keyDown (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return

    const changed = mappings.map((dir) => {
      if (e.which === this.keyCodes[dir]) {
        this.state = { ...this.state, [dir]: true }
        return true
      }
      return false
    }).some((a) => a)

    if (changed) this.onChange(this.state)
    return changed
  }


  keyUp (e) {
    const changed = mappings.map((dir) => {
      if (e.which === this.keyCodes[dir]) {
        this.state = { ...this.state, [dir]: false }
        return true
      }
      return false
    }).some((a) => a)

    if (changed) this.onChange(this.state)
    return changed
  }


  reset () {
    mappings.forEach((dir) => {
      this.state = { ...this.state, [dir]: false }
    })
    this.onChange(this.state)
  }


  hasActiveKeys() {
    return mappings.some((dir) => this.state[dir])
  }
}
