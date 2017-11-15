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
    this._assignMazeIds()
    this._randomlyJoinInRow()
    this._randomlyJoinDownward()

    this.currentY += 1
    return this
  }

  _assignMazeIds() {
    for(let x = 0; x < this.dungeon.width; x += 1) {
      let cell = this.dungeon.get(x, this.currentY)
      if (!cell) {
        cell = new Cell()
        cell.asFloor("NESW")
        cell.meta.isMaze = true
        cell.meta.mazeId = (this.currentY * this.dungeon.width) + x + 1
        cell.meta.colour = "#DDD"
        cell.meta.isLocked = false
      }

      this.dungeon.set(x, this.currentY, cell)
    }
  }

  _randomlyJoinInRow() {
    for(let passes = 0; passes < 10; passes += 1) {
      for(let x = 1; x < this.dungeon.width; x += 1) {
        const prev = this.dungeon.get(x - 1, this.currentY)
        const curr = this.dungeon.get(x, this.currentY)


        const isPrevMaze = prev && prev.meta.isMaze
        const isCurrMaze = curr && curr.meta.isMaze

        if (!isPrevMaze && !isCurrMaze) continue

        const test = this.dungeon.rnd.nextFloat()
        const chance = (this.chanceOfHorizontalJoin / 100.0)

        if (test < chance && !curr.meta.isLocked) {
          curr.meta.mazeId = prev.meta.mazeId
          if (prev.meta.isMaze) prev.removeWalls("E")
          if (curr.meta.isMaze) curr.removeWalls("W")
        }
      }
    }
  }

  _randomlyJoinDownward() {
    const sharedChance = (this.chanceOfVerticalJoin / 100.0)
    let segment = this._getNextSegment(0)
    while (segment) {
      const [start, end, mazeId] = segment
      for(let x = start; x <= end; x += 1) {
        let chance = start === end ? 10.0 : sharedChance
        const test = this.dungeon.rnd.nextFloat()
        const below = this.dungeon.get(x, this.currentY + 1)
        const canGoDown = !below || below.meta.isMaze === true

        if (test < chance && canGoDown) {
          this.dungeon.get(x, this.currentY).removeWalls("S")

          const cell = new Cell()
          cell.asFloor("ESW")
          cell.meta.isMaze = true
          cell.meta.mazeId = mazeId
          cell.meta.colour = "#DDD"
          cell.meta.isLocked = true

          this.dungeon.set(x, this.currentY + 1, cell)
        }
      }
      segment = this._getNextSegment(end + 1)
    }
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
}
