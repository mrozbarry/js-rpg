import Connection from "./Connection"
import Dungeon from "../../shared/Dungeon"

export default class LocalConnection extends Connection {
  constructor(adapter) {
    super()
    this.actorId = null
    this.adapter = adapter
    this.adapter.trigger = this.adapterTrigger.bind(this)
  }

  adapterTrigger(eventName, payload) {
    const { dungeon } = this.state
    this.state = { ...this.state, ...payload }
    if (payload.dungeon && !dungeon) {
      const d = Dungeon.deserialize(payload.dungeon)
      d.generate()
      this.state.dungeon = d
    }
  }

  connect() {
    this.actorId = (new Date()).toISOString().replace(/[^0-9A-Z]/g, "")
    this.adapter.pushEvent("join", { actorId: this.actorId })
  }

  disconnect() {
    const { actorId } = this
    this.actorId = null
    this.adapter.pushEvent("part", { actorId })
  }

  sendInput(input) {
    const { actorId } = this
    this.adapter.pushEvent("input", { actorId, input })
  }
}
