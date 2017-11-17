export default class Broadcaster {
  constructor() {
    this.listeners = []
  }

  addListener(fn) {
    this.listeners.push(fn)
  }

  removeListener(fn) {
    const index = this.listeners.indexOf(fn)
    if (index === -1) return
    this.listeners.splice(index, 1)
  }

  trigger() {
    const triggerArgs = arguments
    this.listeners.forEach((fn) => {
      fn(...triggerArgs)
    })
  }
}
