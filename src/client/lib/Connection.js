import Broadcaster from "../../shared/Broadcaster"

export default class Connection extends Broadcaster {
  constructor() {
    super()
    this.state = {}
  }

  connect() {
    throw new Error("Connection subclass must implement #connect()")
  }

  sendInput(actorId, input) {
    throw new Error("Connection subclass must implement #sendInput()")
  }
}
