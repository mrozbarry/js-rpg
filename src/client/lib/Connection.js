export default class Connection {
  constructor() {
    this.state = {}
  }

  connect() {
    throw new Error("Connection subclass must implement #connect()")
  }

  sendInput(actorId, input) {
    throw new Error("Connection subclass must implement #sendInput()")
  }
}
