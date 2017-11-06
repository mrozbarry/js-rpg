export default class Size {
  constructor({ width, height }) {
    this.size = {
      x: width,
      y: height
    }
  }

  area() {
    return this.size.x *this.size.y
  }
}
