export default class Renderer {
  constructor(canvas) {
    this.tileSize = 64
    this.actorSize = this.tileSize / 4
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    this.ctx.font = "32px VT323"

    window.addEventListener("resize", this.resize.bind(this), false)
    this.width = 0
    this.height = 0
    this.resize()
  }

  init() {
    const vt323 = new FontFace("VT323", "url(https://fonts.gstatic.com/s/vt323/v9/vB0CfoJ37mvN-Rdp92NUWaCWcynf_cDxXwCLxiixG1c.woff2)")
    return vt323.load()
  }

  resize() {
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

  clear() {
    if (!this.ctx) return

    this.ctx.fillStyle = "#444"
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  draw({ dungeon, actors }) {
    if (!this.ctx || !dungeon) return

    this.drawMap(dungeon)
    this.drawActors(actors)
    this.drawVisibility(dungeon)
  }

  drawMap(dungeon) {
    dungeon.data.forEach((cell, idx) => {
      if (!cell || cell.seen === false) return
      const y = Math.floor(idx / dungeon.width)
      const x = idx % dungeon.width

      this.ctx.fillStyle = cell.meta.colour
      const cellX = (x * this.tileSize) //- this.camera.x
      const cellY = (y * this.tileSize) //- this.camera.y
      this.ctx.fillRect(cellX, cellY, this.tileSize, this.tileSize)
      this._drawWalls(cell, cellX, cellY, this.tileSize, this.tileSize)
      if (cell.visible === false) {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        this.ctx.fillRect(cellX, cellY, this.tileSize, this.tileSize)
      }
    })

    // this.ctx.setTransform(1, 0, 0, 1, 0, 0)
  }

  drawActors(actors) {
    Object.keys(actors).forEach((id) => {
      const actor = actors[id]
      const actorX = actor.position.x * this.tileSize
      const actorY = actor.position.y * this.tileSize
      this.ctx.fillStyle = "red"
      this.ctx.fillRect(actorX - (this.actorSize / 2), actorY - (this.actorSize / 2), this.actorSize, this.actorSize)
    })
  }

  drawVisibility(dungeon) {
    dungeon.data.forEach((cell, idx) => {
      if (!cell || cell.seen === false) return
      const y = Math.floor(idx / dungeon.width)
      const x = idx % dungeon.width

      this.ctx.fillStyle = cell.meta.colour
      const cellX = (x * this.tileSize) //- this.camera.x
      const cellY = (y * this.tileSize) //- this.camera.y
      this.ctx.fillStyle = `rgba(0, 0, 0, ${cell.visible})`
      this.ctx.fillRect(cellX, cellY, this.tileSize, this.tileSize)
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
