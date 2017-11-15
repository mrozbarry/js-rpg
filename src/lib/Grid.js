import * as TILES from "./tiles"

export default class Grid {
  constructor(width, height, defaultValue) {
    if (width <= 0 || height <= 0) throw new Error("Cannot create a grid with an axis less than or equal to 0")
    this.width = width
    this.height = height
    this.data = " ".repeat(width * height).split("").map(() => defaultValue)
  }

  _coordToIndex(x, y) {
    return (y * this.width) + x
  }

  _indexToXY(index) {
    const x = index % this.width
    const y = Math.floor(index / this.width)
    return { x, y }
  }

  contains(x, y) {
    return x >= 0 &&
      y >= 0 &&
      x < this.width &&
      y < this.height
  }

  get(x, y) {
    if (!this.contains(x, y)) return undefined
    const index = this._coordToIndex(x, y)
    return this.data[index]
  }

  set(x, y, data) {
    if (!this.contains(x, y)) return
    const index = this._coordToIndex(x, y)
    this.data[index] = data

    return this
  }

  _getIndexesOfRow(x, y, width) {
    return " ".repeat(width).split("").reduce((indexes, _, idx) => {
      if (this.contains(x + idx, y)) {
        return indexes.concat(this._coordToIndex(x + idx, y))
      }
      return indexes
    }, [])
  }

  _getIndexesOfRect(x, y, w, h) {
    return " ".repeat(h).split("")
      .reduce((memo, _, idx) => {
        return memo.concat(this._getIndexesOfRow(x, y + idx, w))
      }, [])
  }

  setRect(x, y, w, h, data) {
    const indexes = this._getIndexesOfRect(x, y, w, h)
    indexes.forEach((idx) => {
      this.data[idx] = data
    })

    return this
  }

  adjacentFrom(x, y, dist = 1) {
    return {
      "north": this.get(x, y - dist),
      "north-east": this.get(x + dist, y - dist),
      "east": this.get(x + dist, y),
      "south-east": this.get(x + dist, y + dist),
      "south": this.get(x, y + dist),
      "south-west": this.get(x - dist, y + dist),
      "west": this.get(x - dist, y),
      "north-west": this.get(x - dist, y - dist),
    }
  }
}

export class Cell {
  constructor() {
    this.asBlank()
    this.meta = {}
  }

  asBlank() {
    this.tile = TILES.blank
    this.walls = ""
  }

  asFloor(walls = "") {
    this.tile = TILES.floor
    this.addWalls(walls)
  }

  asBlock() {
    this.tile = TILES.block
    this.walls = "NESW"
  }

  asStairsUp() {
    this.tile = TILES.stairsUp
    this.walls = ""
  }

  asStairsDown() {
    this.tile = TILES.stairsDown
    this.walls = ""
  }

  addWalls(walls) {
    if (!this.tile === TILES.floor) return
    // TODO: Use a reduce
    this._onlyValidWalls(walls).split("").forEach((wall) => {
      if (this.walls.indexOf(wall) === -1) {
        this.walls += wall
      }
    })
  }

  removeWalls(walls) {
    if (!this.tile === TILES.floor) return
    // TODO: Use a reduce
    this._onlyValidWalls(walls).split("").forEach((wall) => {
      if (this.walls.indexOf(wall) >= 0) {
        this.walls = this.walls.replace(wall, "")
      }
    })
  }

  _onlyValidWalls(walls) {
    return walls.toUpperCase().replace(/[^NESW]/, "")
  }

  isStairs() {
    return [TILES.stairsUp, TILES.stairsDown].indexOf(this.tile) >= 0
  }
}

