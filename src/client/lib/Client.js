import Input from "./Input"
import Renderer from "./Renderer"
import Camera from "./Camera"

export default class Client {
  constructor({ connection, canvas }) {
    this.renderer = new Renderer(canvas)
    this.camera = new Camera(canvas)

    this.connection = connection

    this.input = new Input("vim")
    this.input.bind()

    this.connection.connect()
    this.input.onChange = (input) => {
      this.connection.sendInput(input)
    }

    this._tick = this._tick.bind(this)
    this.lastTickTime = null
    this.renderer.init().then(() => this._tick())
  }

  _tick() {
    this._updateCamera()

    this.renderer.clear()
    this.camera.transform(this.renderer)
    this.renderer.draw(this.connection.state)
    this.camera.reset()

    if (this.connection.state.state === "loading") {
      setTimeout(this._tick, 250)
    } else {
      requestAnimationFrame(this._tick)
    }
  }

  _updateCamera() {
    if (this.connection.actorId && this.connection.state.actors) {
      const actor = this.connection.state.actors[this.connection.actorId]
      if (actor) {
        this.camera.move(actor.position)
      }
    }
  }
}
