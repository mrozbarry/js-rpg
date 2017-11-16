import Input from "./Input"
import Renderer from "./Renderer"
import Actor from "./Actor"

export default class Client {
  constructor({ canvas, width, height }) {
    this.camInp = new Input("vim")
    this.camInp.bind()

    this.actorInp = new Input("wasd")
    this.actorInp.bind()

    this.renderer = new Renderer(width, height)
    this.renderer.setCanvas(canvas)

    this.actor = new Actor()

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

  getCellAtGlobal(x, y) {
    const globalX = Math.floor(x / this.renderer.tileSize)
    const globalY = Math.floor(y / this.renderer.tileSize)
    return this.dungeon.get(globalX, globalY)
  }

  _tick(time) {
    const delta = this.lastTickTime ? time - this.lastTickTime : 0
    this.lastTickTime = time

    this._handleInput(delta)

    this.renderer.drawMap()

    this.tickFrame = requestAnimationFrame(this._tick)
  }

  _handleInput(delta) {
    const camDist = .1
    if (this.camInp.state.up) this.renderer.cameraTo(0, camDist * -1 * delta)
    if (this.camInp.state.down) this.renderer.cameraTo(0, camDist * 1 * delta)
    if (this.camInp.state.left) this.renderer.cameraTo(camDist * -1 * delta, 0)
    if (this.camInp.state.right) this.renderer.cameraTo(camDist * 1 * delta, 0)

    const actorDist = .1
    if (this.actorInp.state.up) this.renderer.cameraTo(0, camDist * -1 * delta)
    if (this.actorInp.state.down) this.renderer.cameraTo(0, camDist * 1 * delta)
    if (this.actorInp.state.left) this.renderer.cameraTo(camDist * -1 * delta, 0)
    if (this.actorInp.state.right) this.renderer.cameraTo(camDist * 1 * delta, 0)
  }
}
