import Input from "./Input"
import Renderer from "./Renderer"

export default class Client {
  constructor({ canvas, width, height }) {
    this.inp = new Input("vim")
    this.inp.bind()

    this.renderer = new Renderer(width, height)
    this.renderer.setCanvas(canvas)

    this.tickFrame = null
    this.lastTickTime = null
    this._tick = this._tick.bind(this)
  }

  start() {
    this.renderer.init().then(() => this._tick())
  }

  stop() {
    if (this.tickFrame) cancelAnimationFrame(this.tickFrame)
    this.tickFrame = null
  }

  _tick(time) {
    const delta = this.lastTickTime ? time - this.lastTickTime : 0
    this.lastTickTime = time

    this._handleInput(delta)

    this.renderer.draw()

    this.tickFrame = requestAnimationFrame(this._tick)
  }

  _handleInput(delta) {
    const dist = .1

    if (this.inp.state.up) this.renderer.cameraTo(0, dist * -1 * delta)
    if (this.inp.state.down) this.renderer.cameraTo(0, dist * 1 * delta)

    if (this.inp.state.left) this.renderer.cameraTo(dist * -1 * delta, 0)
    if (this.inp.state.right) this.renderer.cameraTo(dist * 1 * delta, 0)
  }
}
