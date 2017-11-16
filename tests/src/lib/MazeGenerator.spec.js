import Dungeon from "../../../src/lib/Dungeon"
import MazeGenerator from "../../../src/lib/MazeGenerator"
import { expect } from "chai"

describe("lib/MazeGenerator", () => {
  let dungeon = null
  let generator = null

  beforeEach(() => {
    dungeon = new Dungeon({ seed: "a", width: 5, height: 2 })
    generator = new MazeGenerator(dungeon, { chanceOfHorizontalJoin: 0, chanceOfVerticalJoin: 0 })
  })

  describe("#_assignMazeIds", () => {
    it("sets meta.isMaze and meta.mazeId appropriately per row", () => {
      generator.currentY = 0
      generator._assignMazeIds()
      for(let x = 0; x < dungeon.width; x += 1) {
        const cell = dungeon.get(x, 0)
        expect(cell.meta.isMaze).to.be.ok
        expect(cell.meta.mazeId).to.equal(x)
      }
      generator.currentY = 1
      generator._assignMazeIds()
      for(let x = 0; x < dungeon.width; x += 1) {
        const cell = dungeon.get(x, 1)
        expect(cell.meta.isMaze).to.be.ok
        expect(cell.meta.mazeId).to.equal(5 + x)
      }
    })
  })

  describe("#_randomlyJoinInRow", () => {
    generator.currentY = 0
    generator._assignMazeIds()
  })
})
