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
    const isFirst = this.currentY === 0
    const isLast = this.currentY === this.dungeon.height - 1

    if (isFirst) {
      this._firstRowInit()
      this._doRowUnions()
      this._openBottomWalls()
    } else if (isLast) {
      this._middleRowInit()
      this._doRowUnions()
      this._completeMaze()
    } else {
      this._middleRowInit()
      this._doRowUnions()
      this._openBottomWalls()
    }


    this.currentY += 1
    return this
  }

  _enforceBorder(cell, x) {
    if (x === 0) {
      cell.addWalls("W")
    } else if (x === this.dungeon.width - 1) {
      cell.addWalls("E")
    }
  }

  _completeMaze() {
    let oldId = null
    for(let x = 1; x < this.dungeon.width; x += 1) {
      const prev = this.dungeon.get(x - 1, this.currentY)
      const curr = this.dungeon.get(x, this.currentY)
      if (curr.meta.isMaze && curr.meta.mazeId === oldId) continue

      if (!prev.meta.isMaze && curr.meta.isMaze) {
        curr.addWalls("W")
      } else if (prev.meta.isMaze && !curr.meta.isMaze) {
        prev.addWalls("E")
      } else if (prev.meta.isMaze && curr.meta.isMaze) {
        if (prev.meta.mazeId !== curr.meta.mazeId) {
          prev.removeWalls("E")
          curr.removeWalls("W")
        }
        oldId = curr.meta.mazeId
        curr.meta.mazeId = prev.meta.mazeId
      }
    }
  }

  _middleRowInit() {
    for(let x = 0; x < this.dungeon.width; x += 1) {
      const curr = this.dungeon.get(x, this.currentY)
      if (curr) continue

      const initialId = (this.currentY * this.dungeon.width) + x
      const above = this.dungeon.get(x, this.currentY - 1)
      const aboveHasSouthWall = above.hasWalls("S")
      const c = this._mazeCell(aboveHasSouthWall ? initialId : above.meta.mazeId || initialId)
      if (!aboveHasSouthWall) c.removeWalls("N")
      this._enforceBorder(c, x)
      this.dungeon.set(x, this.currentY, c)
    }
  }

  _firstRowInit() {
    for(let x = 0; x < this.dungeon.width; x += 1) {
      const cell = this.dungeon.get(x, this.currentY)
      if (cell) continue
      const mazeCell = this._mazeCell(x + 1)
      this._enforceBorder(mazeCell, x)

      this.dungeon.set(x, this.currentY, mazeCell)
    }
  }

  _doRowUnions() {
    for(let x = 1; x < this.dungeon.width; x += 1) {
      const prev = this.dungeon.get(x - 1, this.currentY)
      const curr = this.dungeon.get(x, this.currentY)

      if (!prev.meta.isMaze && !curr.meta.isMaze) continue

      const wallOffRoom = randItem(this.dungeon.rnd, [true, false])

      if (!prev.meta.isMaze && curr.meta.isMaze) {
        if (wallOffRoom) {
          curr.addWalls("W")
        } else {
          prev.removeWalls("E")
        }
      } else if (prev.meta.isMaze && !curr.meta.isMaze) {
        if (wallOffRoom) {
          prev.addWalls("E")
        } else {
          curr.removeWalls("W")
        }
      } else if (prev.meta.isMaze && curr.meta.isMaze) {
        const sameIds = prev.meta.mazeId === curr.meta.mazeId
        if (!sameIds && randItem(this.dungeon.rnd, [true, false])) {
          curr.meta.mazeId = prev.meta.mazeId
        } else {
          prev.addWalls("E")
          curr.addWalls("W")
        }
      }
    }
  }

  _openBottomWalls() {
    let seg = this._nextSegment(0, this.currentY)
    while (seg) {
      const [start, end, id] = seg

      this._openBottomWallsSegment(start, end, id)
      // Do stuff with

      seg = this._nextSegment(end + 1, this.currentY)
    }
  }

  _openBottomWallsSegment(start, end, id) {
    const x = randInt(this.dungeon.rnd, start, end)

    this.dungeon.get(x, this.currentY).removeWalls("S")
    const below = this.dungeon.get(x, this.currentY + 1)
    if (below) {
      below.removeWalls("N")
    }

    if (randItem(this.dungeon.rnd, [true, false])) {
      return this._openBottomWallsSegment(start, end, id)
    }
  }


  _nextSegment(start, y) {
    if (start >= this.dungeon.width) return null
    const cell = this.dungeon.get(start, y)
    if (!cell || !cell.meta.isMaze) return this._nextSegment(start + 1, y)
    const id = cell.meta.mazeId
    for(let x = start; x < this.dungeon.width; x += 1) {
      const c = this.dungeon.get(x, y)
      if (!c || !c.meta.isMaze || c.meta.mazeId !== id) {
        return [start, x - 1, id]
      }
    }
    return [start, this.dungeon.width - 1, id]
  }

  _mazeCell(mazeId) {
    const c = new Cell()
    c.asFloor("")
    c.meta.isMaze = true
    c.meta.mazeId = mazeId
    c.meta.colour = "#DDD"
    c.addWalls("NS")
    return c
  }
}
