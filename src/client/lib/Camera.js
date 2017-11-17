export default class Camera {
  constructor(canvas) {
    this.x = 0
    this.y = 0
    this.ctx = canvas.getContext("2d")
  }

  move({ x, y }) {
    this.x = x
    this.y = y
  }

  transform({ width, height, tileSize }) {
    this.ctx.translate(
      Math.round(width / 2) - (this.x * tileSize),
      Math.round(height / 2) - (this.y * tileSize),
    )
  }

  reset() {
    this.ctx.resetTransform()
  }

}
