export default class Actor {
  constructor() {
    this.x = 0
    this.y = 0
    this.colour = "red"
    this.size = 0.5
  }

  move(dx, dy) {
    this.x += dx
    this.y += dy
  }

  moveTo(x, y) {
    this.x = x
    this.y = y
  }
}
