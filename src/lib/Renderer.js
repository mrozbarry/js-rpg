import Grid from "./Grid"
import * as TILES from "./tiles"

export default class Renderer {
  constructor(width, height) {
    this.size = { x: width, y: height }
    this.bounds = this.size
    this.tileSize = 8

    this.dungeon = null
    this.tiles = new Grid(1, 1)
    this.collisionMap = new Grid(1, 1)

    this.actors = []
    this.items = []
  }

  init() {
    const vt323 = new FontFace("VT323", "url(https://fonts.gstatic.com/s/vt323/v9/vB0CfoJ37mvN-Rdp92NUWaCWcynf_cDxXwCLxiixG1c.woff2)")
    return vt323.load()
  }

  resize(width, height) {
    this._resizeCanvas()
  }

  setDungeon(dungeon) {
    this.dungeon = dungeon
    this.cameraAt(0, 0)
  }

  cameraTo(dx, dy) {
    this.cameraAt(
      this.camera.x + dx,
      this.camera.y + dy
    )
  }

  cameraAt(x, y) {
    this.camera = {
      x: x,
      y: y
    }
  }

  setCanvas(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")

    this.ctx.font = "32px VT323"

    this._resizeCanvas()
  }

  _resizeCanvas() {
    if (!this.canvas) return

    this.canvas.width = this.size.x
    this.canvas.height = this.size.y
  }

  draw() {
    if (!this.ctx) return

    this.ctx.fillStyle = "#444"
    this.ctx.fillRect(0, 0, this.size.x, this.size.y)

    this.ctx.strokeStyle = "white"
    this.ctx.strokeRect(0, 0, this.dungeon.width * this.tileSize, this.dungeon.height * this.tileSize)

    this.dungeon.data.forEach((cell, idx) => {
      if (!cell) return
      const { x, y } = this.dungeon._indexToXY(idx)

      // let doDraw = true
      // switch(cell.tile) {
      // case TILES.floor:
      //   this.ctx.fillStyle = "#CCC"
      //   break
      //
      // case TILES.stairsUp:
      //   this.ctx.fillStyle = "yellow"
      //   break
      //
      // case TILES.stairsDown:
      //   this.ctx.fillStyle = "red"
      //   break
      //
      // default:
      //   doDraw = false
      //
      // }
      this.ctx.fillStyle = cell.meta.colour
      const cellX = (x * this.tileSize) - this.camera.x
      const cellY = (y * this.tileSize) - this.camera.y
      this.ctx.fillRect(cellX, cellY, this.tileSize, this.tileSize)
      this._drawWalls(cell, cellX, cellY, this.tileSize, this.tileSize)
    })
  }

  _drawWalls(cell, x, y, w, h) {
    const wall = {
      N: { x1: x, y1: y, x2: x + w, y2: y },
      E: { x1: x + w, y1: y, x2: x + w, y2: y + h },
      S: { x1: x, y1: y + h, x2: x + w, y2: y + h },
      W: { x1: x, y1: y, x2: x, y2: y + h },
    }

    const olw = this.ctx.lineWidth
    this.ctx.lineWidth = 3
    this.ctx.strokeStyle = "black"
    cell.walls.split("").forEach((directionKey) => {
      const line = wall[directionKey]
      this.ctx.beginPath()
      this.ctx.moveTo(line.x1, line.y1)
      this.ctx.lineTo(line.x2, line.y2)
      this.ctx.stroke()
    })
    this.ctx.lineWidth = olw
  }
}
