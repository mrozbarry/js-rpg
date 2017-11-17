import Input from "./Input"
import Renderer from "./Renderer"
import Camera from "./Camera"

export default class Client {
  constructor({ connection, canvas }) {
    this.renderer = new Renderer(canvas)
    this.camera = new Camera(canvas)

    this._actorId = null
    this._worldState = {}

    this.connection = connection
    this.connection.addListener(this._handleWorldUpdate.bind(this))

    this.input = new Input("vim")
    this.input.bind()

    this.connection.connect()
      .then((actorId) => {
        this._actorId = actorId
        this.input.onChange = (state) => {
          this.connection.sendInput(actorId, state)
        }
      })

    this.lastTickTime = null
    this.renderer.init().then(() => this._tick())
  }

  _tick() {
    this.renderer.clear()
    this.camera.transform(this.renderer)
    this.renderer.draw(this._worldState)
    this.camera.reset()
  }

  _handleWorldUpdate({ dungeon, actors, state }, eventName) {
    if (this._actorId) {
      const actor = actors[this._actorId]
      this.camera.move(actor.position)
    }

    this._worldState = { ...this._worldState, actors, state }

    if (eventName === "dungeon") {
      this._worldState = { ...this._worldState, dungeon }
    }

    this._tick()
  }
}
