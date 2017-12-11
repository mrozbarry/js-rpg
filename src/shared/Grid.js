import * as TILES from "./tiles"

export default class Grid {
  constructor(width, height, defaultValue) {
    if (width <= 0 || height <= 0) throw new Error("Cannot create a grid with an axis less than or equal to 0")
    this.width = width
    this.height = height
    this.data = " ".repeat(width * height).split("").map(() => defaultValue)
  }

  serialize() {
    return {
      width: this.width,
      height: this.height,
      data: this.data.map((cell) => cell ? cell.serialize() : null)
    }
  }

  static deserialize({ width, height, data }) {
    if (data.length !== (width * height)) throw new Error("Data length doesn't match size constraints")
    const g = new Grid(width, height)
    g.data = data.map((d) => Cell.deserialize(d))
    return g
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
}

export class Cell {
  constructor() {
    this.asBlank()
    this.meta = {}
  }

  serialize() {
    const { tile, walls, meta } = this
    return { tile, walls, meta }
  }

  static deserialize({ tile, walls, meta }) {
    const c = new Cell()
    c.tile = tile
    c.walls = walls
    c.meta = { ...meta }
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

  hasWalls(walls) {
    return this._onlyValidWalls(walls)
      .split("")
      .every((w) => this.walls.indexOf(w) >= 0)
  }

  _onlyValidWalls(walls) {
    return walls.toUpperCase().replace(/[^NESW]/, "")
  }

  isStairs() {
    return [TILES.stairsUp, TILES.stairsDown].indexOf(this.tile) >= 0
  }
}

