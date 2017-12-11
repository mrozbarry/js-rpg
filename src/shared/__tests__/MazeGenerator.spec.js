import Dungeon from "../Dungeon"
import MazeGenerator from "../MazeGenerator"
import chai, { expect } from "chai"
import sinon from "sinon"
import sinonChai from "sinon-chai"
chai.use(sinonChai)

const dungeons = {
  line: new Dungeon({ width: 3, height: 1, seed: "line" }),
  small: new Dungeon({ width: 3, height: 3, seed: "small" }),
}

describe("shared/MazeGenerator", () => {
  describe(".constructor", () => {
    it("creates a new instance, setting dungeon, chanceOfHorizontalSplit, and chanceOfMultipleVerticalJoins, and resets currentY to 0", () => {
      const mg = new MazeGenerator(dungeons.small, { chanceOfHorizontalSplit: 50, chanceOfMultipleVerticalJoins: 50 })
      expect(mg.dungeon).to.equal(dungeons.small)
      expect(mg.chanceOfHorizontalSplit).to.equal(50)
      expect(mg.chanceOfMultipleVerticalJoins).to.equal(50)
      expect(mg.currentY).to.equal(0)
    })

    it("throws if no options are passed", () => {
      expect(() => { const mg = new MazeGenerator(dungeons.small) }).to.throw()
    })
  })

  describe("#reset", () => {
    it("sets .currentY to 0", () => {
      const mg = new MazeGenerator(dungeons.small, { chanceOfHorizontalSplit: 50, chanceOfMultipleVerticalJoins: 50 })
      mg.currentY = 2
      mg.reset()
      expect(mg.currentY).to.equal(0)
    })
  })

  describe("#percentDone", () => {
    it("initially returns 0", () => {
      const mg = new MazeGenerator(dungeons.small, { chanceOfHorizontalSplit: 50, chanceOfMultipleVerticalJoins: 50 })
      expect(mg.percentDone()).to.equal(0)
    })

    it("returns a decimal between 0.0 and 1.0 based on currentY and the dungeon height", () => {
      const mg = new MazeGenerator(dungeons.small, { chanceOfHorizontalSplit: 50, chanceOfMultipleVerticalJoins: 50 })
      mg.currentY = 1
      expect(mg.percentDone()).to.equal(1 / 3)
    })
  })

  describe("#canGenerate", () => {
    it("returns true as long as percentDone is less than 1.0", () => {
      const mg = new MazeGenerator(dungeons.small, { chanceOfHorizontalSplit: 50, chanceOfMultipleVerticalJoins: 50 })
      expect(mg.canGenerate()).to.be.ok
      mg.currentY = 1
      expect(mg.canGenerate()).to.be.ok
      mg.currentY = 2
      expect(mg.canGenerate()).to.be.ok
    })

    it("returns false if percentDone is 1.0", () => {
      const mg = new MazeGenerator(dungeons.small, { chanceOfHorizontalSplit: 50, chanceOfMultipleVerticalJoins: 50 })
      mg.currentY = 3
      expect(mg.canGenerate()).to.not.be.ok
    })

    it("returns false if percentDone is greater than 1.0", () => {
      const mg = new MazeGenerator(dungeons.small, { chanceOfHorizontalSplit: 50, chanceOfMultipleVerticalJoins: 50 })
      mg.currentY = 4
      expect(mg.canGenerate()).to.not.be.ok
    })
  })

  describe("#generateStep", () => {
    it("returns a reference to this", () => {
      const mg = new MazeGenerator(dungeons.small, { chanceOfHorizontalSplit: 50, chanceOfMultipleVerticalJoins: 50 })
      expect(mg.generateStep()).to.equal(mg)
    })

    describe("on first row", () => {
      it("runs _firstRowInit, _doRowUnions, and _openBottomWalls for the first row", () => {
        const mg = new MazeGenerator(dungeons.small, { chanceOfHorizontalSplit: 50, chanceOfMultipleVerticalJoins: 50 })

        const firstRowInitSpy = sinon.spy(mg, "_firstRowInit")
        const doRowUnionsSpy = sinon.spy(mg, "_doRowUnions")
        const openBottomWallsSpy = sinon.spy(mg, "_openBottomWalls")
        mg.generateStep()

        expect(firstRowInitSpy).to.be.called
        expect(doRowUnionsSpy).to.be.called
        expect(openBottomWallsSpy).to.be.called
      })

      it("does not run _middleRowInit or _completeMaze", () => {
        const mg = new MazeGenerator(dungeons.small, { chanceOfHorizontalSplit: 50, chanceOfMultipleVerticalJoins: 50 })

        const middleRowInitSpy = sinon.spy(mg, "_middleRowInit")
        const completeMazeSpy = sinon.spy(mg, "_completeMaze")
        mg.generateStep()

        expect(middleRowInitSpy).to.not.be.called
        expect(completeMazeSpy).to.not.be.called
      })
    })

    describe("on a middle row", () => {
      it("runs _middleRowInit, _doRowUnions, _openBottomWalls", () => {
        const mg = new MazeGenerator(dungeons.small, { chanceOfHorizontalSplit: 50, chanceOfMultipleVerticalJoins: 50 })
        mg.generateStep()

        const middleRowInitSpy = sinon.spy(mg, "_middleRowInit")
        const doRowUnionsSpy = sinon.spy(mg, "_doRowUnions")
        const openBottomWallsSpy = sinon.spy(mg, "_openBottomWalls")
        mg.generateStep()

        expect(middleRowInitSpy).to.be.called
        expect(doRowUnionsSpy).to.be.called
        expect(openBottomWallsSpy).to.be.called
      })

      it("does not run _firstRowInit, or _completeMaze", () => {
        const mg = new MazeGenerator(dungeons.small, { chanceOfHorizontalSplit: 50, chanceOfMultipleVerticalJoins: 50 })
        mg.generateStep()

        const firstRowInitSpy = sinon.spy(mg, "_firstRowInit")
        const completeMazeSpy = sinon.spy(mg, "_completeMaze")

        expect(firstRowInitSpy).to.not.be.called
        expect(completeMazeSpy).to.not.be.called
      })
    })

    describe("on the last row", () => {
      it("runs _middleRowInit, _doRowUnions, _completeMaze", () => {
        const mg = new MazeGenerator(dungeons.small, { chanceOfHorizontalSplit: 50, chanceOfMultipleVerticalJoins: 50 })
        mg.generateStep()
        mg.generateStep()

        const middleRowInitSpy = sinon.spy(mg, "_middleRowInit")
        const doRowUnionsSpy = sinon.spy(mg, "_doRowUnions")
        const completeMazeSpy = sinon.spy(mg, "_completeMaze")
        mg.generateStep()

        expect(middleRowInitSpy).to.be.called
        expect(doRowUnionsSpy).to.be.called
        expect(completeMazeSpy).to.be.called
      })

      it("does not run _firstRowInit, or _openBottomWalls", () => {
        const mg = new MazeGenerator(dungeons.small, { chanceOfHorizontalSplit: 50, chanceOfMultipleVerticalJoins: 50 })
        mg.generateStep()
        mg.generateStep()

        const firstRowInitSpy = sinon.spy(mg, "_firstRowInit")
        const openBottomWallsSpy = sinon.spy(mg, "_openBottomWalls")

        expect(firstRowInitSpy).to.not.be.called
        expect(openBottomWallsSpy).to.not.be.called
      })
    })
  })

  xdescribe("#_firstRowInit", () => {
  })


  xdescribe("#_doRowUnions", () => {
  })


  xdescribe("#_openBottomWalls", () => {
  })


  xdescribe("#_nextSegment", () => {
  })


  xdescribe("#_enforceBorder", () => {
  })


  xdescribe("#_completeMaze", () => {
  })


  xdescribe("#_mazeCell", () => {
  })

})

