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
    this._updateVisibility()
    this.renderer.clear()
    this.camera.transform(this.renderer)
    this.renderer.draw(this._worldState)
    this.camera.reset()
  }

  _updateVisibility() {
    const { _actorId } = this
    const { dungeon, actors } = this._worldState
    if (dungeon && actors && _actorId) {
      const actor = actors[this._actorId]
      const px = Math.floor(actor.position.x)
      const py = Math.floor(actor.position.y)

      dungeon.data.forEach((cell, idx) => {
        const cy = Math.floor(idx / dungeon.width)
        const cx = idx % dungeon.width

        const dist = Math.min(Math.sqrt(
          ((cx - px) * (cx - px)) +
          ((cy - py) * (cy - py))
        ), 6)

        cell.visible = (dist / 6.0)
        cell.seen = cell.seen || (dist < 6)
      })
    }
  }

  _handleWorldUpdate({ dungeon, actors, state }, eventName) {
    if (this._actorId) {
      const actor = actors[this._actorId]
      this.camera.move(actor.position)
    }

    this._worldState = { ...this._worldState, actors, state }

    if (eventName === "dungeon") {
      this._worldState = {
        ...this._worldState,
        dungeon: {
          ...dungeon,
          data: dungeon.data.map((c) => ({ ...c, seen: false, visible: false }))
        }
      }
    }

    this._tick()
  }
}
