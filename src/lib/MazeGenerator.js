import Generator from "./Generator"
import { Cell } from "./Grid"
import * as TILES from "./tiles"
import { randInt, randItem, randColour } from "./random"

export default class MazeGenerator extends Generator {
  constructor(dungeon, { chanceOfHorizontalJoin, chanceOfVerticalJoin }) {
    super(dungeon)
    this.chanceOfHorizontalJoin = chanceOfHorizontalJoin
    this.chanceOfVerticalJoin = chanceOfVerticalJoin
    this.reset()
  }

  reset() {
    this.currentY = 0
  }

  percentDone() {
    return this.currentY / this.dungeon.height
  }

  canGenerate() {
    return this.percentDone() < 1.0
  }

  generateStep() {
    console.group("maze", this.currentY)
    // const isFirst = this.currentY === 0
    // const isLast = this.currentY === this.dungeon.height - 1
    //
    // if (isFirst) {
    // } else if (isLast) {
    // } else {
    // }

    this._assignMazeIds()
    const isAboveBottomRow = this.currentY < this.dungeon.height - 1
    this._randomlyJoinInRow()
    if (isAboveBottomRow) {
      this._randomlyJoinDownward()
    } else {
      this._completeMaze()
    }
    console.groupEnd()

    this.currentY += 1
    return this
  }

  _assignMazeIds() {
    for(let x = 0; x < this.dungeon.width; x += 1) { let cell = this.dungeon.get(x, this.currentY)
      if (!cell) {
        cell = new Cell()
        cell.asFloor("NS")
        if (x === 0) cell.addWalls("W")
        if (x === this.dungeon.width - 1) cell.addWalls("E")
        cell.meta.isMaze = true
        cell.meta.mazeId = (this.currentY * this.dungeon.width) + x
        cell.meta.colour = "#DDD"
        cell.meta.isLocked = false
      }

      this.dungeon.set(x, this.currentY, cell)
    }
  }

  _randomlyJoinInRow() {
    for(let x = 1; x < this.dungeon.width; x += 1) {
      const prev = this.dungeon.get(x - 1, this.currentY)
      const curr = this.dungeon.get(x, this.currentY)

      if (x === 1) {
        prev.addWalls("W")
      }
      if (x === this.dungeon.width - 1) {
        curr.addWalls("E")
      }

      const bothMaze = prev.meta.isMaze && curr.meta.isMaze
      if (bothMaze) {
        const sameIds = prev.meta.mazeId === curr.meta.mazeId
        if (sameIds) {
          prev.addWalls("E")
          curr.addWalls("W")
        } else if (randItem(this.dungeon.rnd, [true, false])) {
          prev.addWalls("E")
          curr.addWalls("W")
        } else {
          curr.meta.mazeId = prev.meta.mazeId
        }
      }
    }
    const startId = (this.currentY * this.dungeon.width)
    const mazeIds = this.dungeon.data
      .slice(startId, startId + this.dungeon.width)
      .map((c) => c.meta.mazeId)
    console.log("mazeIds", mazeIds)
  }

  _randomlyJoinDownward() {
    const sharedChance = (this.chanceOfVerticalJoin / 100.0)
    let segment = this._getNextSegment(0)
    while (segment) {
      const [start, end, mazeId] = segment
      console.group({ start, end, mazeId })
      this._joinSegmentDownward(start, end, mazeId)
      segment = this._getNextSegment(end + 1)
      console.groupEnd()
    }
  }

  _joinSegmentDownward(start, end, mazeId) {
    const x = randInt(this.dungeon.rnd, start, end)
    const res = this._joinDownward(x, mazeId)
    console.log("joinSegmentDownward", { x, mazeId, res })

    if (randItem(this.dungeon.rnd, [true, false])) {
      this._joinSegmentDownward(start, end, mazeId)
    }
  }

  _joinDownward(x, mazeId) {
    const below = this.dungeon.get(x, this.currentY + 1)
    const canGoDown = !below || below.meta.isMaze === true

    if (!canGoDown) return false

    this.dungeon.get(x, this.currentY).removeWalls("S")

    const cell = new Cell()
    cell.asFloor("S")
    cell.meta.isMaze = true
    cell.meta.mazeId = mazeId
    cell.meta.colour = "#DDD"
    cell.meta.isLocked = true

    this.dungeon.set(x, this.currentY + 1, cell)
    return true
  }

  _getNextSegment(start) {
    if (start >= this.dungeon.width) return null
    const cell = this.dungeon.get(start, this.currentY)
    if (!cell || !cell.meta.isMaze) {
      return this._getNextSegment(start + 1)
    }
    const comparisonId = cell.meta.mazeId

    for(let x = start; x < this.dungeon.width; x += 1) {
      const current = this.dungeon.get(x, this.currentY)

      if (current.meta.mazeId != comparisonId) {
        return [start, x - 1, comparisonId]
      }
    }
    return [start, this.dungeon.width - 1, comparisonId]
  }

  _completeMaze() {
    for(let x = 1; x < this.dungeon.width; x += 1) {
      const prev = this.dungeon.get(x - 1, this.dungeon.height - 1)
      const curr = this.dungeon.get(x, this.dungeon.height - 1)

      const bothMaze = prev.meta.isMaze && curr.meta.isMaze
      const differentIds = prev.meta.mazeId != curr.meta.mazeId
      if (bothMaze && differentIds) {
        prev.removeWalls("E")
        curr.removeWalls("W")
        curr.meta.mazeId = prev.meta.mazeId
      }
    }
  }
}
