import Camera from "./Camera"
import Dungeon from "../../shared/Dungeon"
import visibility, { initialVisibility } from "../../shared/visibility"

export default class Renderer {
  constructor (canvas) {
    this.tileSize = 64
    this.actorSize = this.tileSize / 4
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    this.ctx.font = "32px VT323"

    this.camera = new Camera(canvas)
    this.visibility = initialVisibility()
    this.camera.onChange = ({ x, y }) => {
      this.visibility = visibility(this.dungeon, { x, y }, this.visibility)
      console.log(this.visibility)
    }

    this.dungeon = null

    window.addEventListener("resize", this.resize.bind(this), false)
    this.width = 0
    this.height = 0
    this.resize()
  }


  getCamera () {
    return this.camera
  }


  init () {
    const vt323 = new FontFace("VT323", "url(https://fonts.gstatic.com/s/vt323/v9/vB0CfoJ37mvN-Rdp92NUWaCWcynf_cDxXwCLxiixG1c.woff2)")
    return vt323.load()
  }


  setDungeon ({ dungeon }) {
    this.dungeon = dungeon
  }


  resize () {
    if (this._resizeTimeout) clearTimeout(this._resizeTimeout)

    this._resizeTimeout = setTimeout(() => {
      const { body } = document

      this.width = body.scrollWidth
      this.height = body.scrollHeight
      this.canvas.width = this.width
      this.canvas.height = this.height
      this._resizeTimeout = null
    }, 5)
  }


  clear () {
    if (!this.ctx) return

    this.ctx.fillStyle = "#444"
    this.ctx.fillRect(0, 0, this.width, this.height)
  }


  draw (actors) {
    if (!this.ctx || !this.dungeon) return

    this.camera.transform(this)
    this.drawMap()
    this.drawActors(actors)
    this.camera.reset()
  }


  drawMap () {
    const position = { x: this.camera.x, y: this.camera.y }

    this.visibility.currentlyVisibleIndexes.forEach((index) => {
      const cell = this.dungeon.data[index]
      if (!cell) return

      const y = Math.floor(index / this.dungeon.width)
      const x = index % this.dungeon.width

      this.ctx.fillStyle = cell.meta.colour
      const cellX = Math.floor(x * this.tileSize) //- this.camera.x
      const cellY = Math.floor(y * this.tileSize) //- this.camera.y
      this.ctx.fillRect(cellX, cellY, this.tileSize, this.tileSize)
      this._drawWalls(cell, cellX, cellY, this.tileSize, this.tileSize)
    })

    // this.dungeon.data.forEach((cell, idx) => {
    //   if (!cell) return
    //   const y = Math.floor(idx / this.dungeon.width)
    //   const x = idx % this.dungeon.width
    //
    //   const dist = Math.sqrt(
    //     ((position.x - x) * (position.x - x)) +
    //     ((position.y - y) * (position.y - y))
    //   )
    //
    //   this.ctx.fillStyle = cell.meta.colour
    //   const cellX = Math.floor(x * this.tileSize) //- this.camera.x
    //   const cellY = Math.floor(y * this.tileSize) //- this.camera.y
    //   this.ctx.fillRect(cellX, cellY, this.tileSize, this.tileSize)
    //   this._drawWalls(cell, cellX, cellY, this.tileSize, this.tileSize)
    // })
  }


  drawActors (actors) {
    if (!actors) return
    Object.keys(actors).forEach((id) => {
      const actor = actors[id]
      if (!actor) return
      const actorX = actor.position.x * this.tileSize
      const actorY = actor.position.y * this.tileSize
      this.ctx.fillStyle = "red"
      this.ctx.fillRect(actorX - (this.actorSize / 2), actorY - (this.actorSize / 2), this.actorSize, this.actorSize)
    })
  }

  _drawWalls (cell, x, y, w, h) {
    const wall = {
      N: { x1: x, y1: y, x2: x + w, y2: y },
      E: { x1: x + w, y1: y, x2: x + w, y2: y + h },
      S: { x1: x, y1: y + h, x2: x + w, y2: y + h },
      W: { x1: x, y1: y, x2: x, y2: y + h },
    }

    const olw = this.ctx.lineWidth
    this.ctx.lineWidth = 2
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
