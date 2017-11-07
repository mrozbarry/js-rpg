export default class CellGrid {
  constructor({ width, height }) {
    this.cells = []
    this.resize({ width, height })
  }

  resize({ width, height }) {
    if (width < 1) {
      throw new Error('Cannot have a width less than 1')
    }

    if (height < 1) {
      throw new Error('Cannot have a height less than 1')
    }

    this.size = {
      x: width,
      y: height,
    }
    const newCells = "y".repeat(height).split("").map((_y, y) =>
      "x".repeat(width).split("").map((_x, x) => {
        if (this.cells && this.cells[y]) {
          return this.cells[y][x]
        }
        return null
      })
    )
    this.cells = newCells
  }

  each(callback) {
    for(let y = 0; y < this.size.y; y++) {
      for(let x = 0; x < this.size.x; x++) {
        callback(x, y, this.cells[y][x])
      }
    }
  }

  map(callback) {
    console.log('CellGrid.map', this.cells)
    for(let y = 0; y < this.size.y; y++) {
      for(let x = 0; x < this.size.x; x++) {
        this.cells[y][x] = callback(x, y, this.cells[y][x])
      }
    }
  }

  reduce(callback, initialValue) {
    let memo = initialValue
    for(let y = 0; y < this.size.y; y++) {
      for(let x = 0; x < this.size.x; x++) {
        memo = callback(memo, x, y, this.cells[y][x])
      }
    }
    return memo
  }

  all(callback) {
    for(let y = 0; y < this.size.y; y++) {
      for(let x = 0; x < this.size.x; x++) {
        if (Boolean(callback(x, y, this.cells[y][x])) === false) {
          return false
        }
      }
    }
    return true
  }

  some(callback) {
    for(let y = 0; y < this.size.y; y++) {
      for(let x = 0; x < this.size.x; x++) {
        if (Boolean(callback(x, y, this.cells[y][x]))) {
          return true
        }
      }
    }
    return false
  }

  region(x, y, w, h) {
    const grid = new CellGrid({ width: w, height: h })

    const minY = Math.min(Math.max(y, 0), this.size.y)
    const maxY = Math.min(Math.max(y + h, 0), this.size.y)
    const minX = Math.min(Math.max(x, 0), this.size.x)
    const maxX = Math.min(Math.max(x + w, 0), this.size.x)

    for(let ry = minY; ry < maxY; ry++) {
      for(let rx = minX; rx < maxX; rx++) {
        grid.cells[ry - y][rx - x] = this.cells[ry][rx]
      }
    }

    return grid
  }
}
