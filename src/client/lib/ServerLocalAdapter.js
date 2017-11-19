export default class ServerAdapter {
  constructor() {
    this.events = []
  }

  pushEvent(type, data) {
    this.events.push({ ...data, type })
  }

  consumeEvent() {
    const event = this.events.splice(0, 1)[0]
    if (!event) return Promise.reject("empty")
    return Promise.resolve(event)
  }

  trigger(eventName, payload) {
    throw new Error("Adapter must implement #trigger()")
  }
}
