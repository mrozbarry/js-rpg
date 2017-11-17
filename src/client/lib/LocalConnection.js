import Connection from "./Connection"

export default class LocalConnection extends Connection {
  constructor(server) {
    super()
    this.server = server
    this.server.addListener(this._handleServerUpdate.bind(this))
    this.actorId = null
  }

  _handleServerUpdate(state, eventName) {
    this.trigger(state, eventName)
  }

  connect() {
    return this.server.onConnect()
      .then((actorId) => {
        this.actorId = actorId
        return actorId
      })
      .catch((err) => {
        console.warn(err)
      })
  }

  disconnect() {
    if (!this.actorId) return
    return this.server.onDisconnect(this.actorId)
  }

  sendInput(id, input) {
    this.server.onInput(id, input)
  }
}
