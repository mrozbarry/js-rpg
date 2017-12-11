import Grid from "../Grid.js"
import { expect } from "chai"

describe("shared/Grid", () =>  {
  describe("class Grid", () =>  {
    describe(".new", () =>  {
      it("creates a new grid with the appropriate amount of data", () =>  {
        const g = new Grid(1, 1)
        expect(g.width).to.equal(1)
        expect(g.height).to.equal(1)
        expect(g.data.length).to.equal(1)
      })

      it("throws when width or height is negative", () =>  {
        expect(() => new Grid(-1, 1)).to.throw()
        expect(() => new Grid(1, -1)).to.throw()
        expect(() => new Grid(-1, -1)).to.throw()

      })
    })

    describe("#_coordToIndex", () => {
      const g = new Grid(3, 3)

      it("calculates the correct values", () => {
        expect(g._coordToIndex(0, 0)).to.equal(0)
        expect(g._coordToIndex(1, 0)).to.equal(1)
        expect(g._coordToIndex(0, 1)).to.equal(3)
        expect(g._coordToIndex(2, 1)).to.equal(5)

      })

      it("can calculate out of range values", () => {
        expect(g._coordToIndex(-1, 0)).to.equal(-1)
        expect(g._coordToIndex(-3, 0)).to.equal(-3)
      })
    })

    describe("#contains", () =>  {
      const g = new Grid(5, 5)

      it("contains all points between 0 and 4 on each axis", () => {
        for(let x = 0; x < 5; x++) {
          for(let y = 0; y < 5; y++) {
            expect(g.contains(x, y)).to.be.ok
          }
        }
      })

      it("does not contain negative values", () => {
        expect(g.contains(-1, -1)).to.not.be.ok
      })

      it("does not contain axis values greater than or equal to width/height", () => {
        expect(g.contains(5, 5)).to.not.be.ok
      })

    })

    describe("#get", () => {
      const g = new Grid(2, 2, "bar")
      g.set(0, 0, "foo")

      it("finds foo at 0,0", () => {
        expect(g.get(0, 0)).to.equal("foo")
      })

      it("finds bar at all other coordinates", () => {
        for(let x = 0; x < 2; x++) {
          for(let y = 0; y < 2; y++) {
            if (x === 0 && y === 0) continue
            expect(g.get(x, y)).to.equal("bar")
          }
        }
      })

      it("finds undefined when x/y is out of range", () => {
        expect(g.get(-1, -1)).to.equal(undefined)
        expect(g.get(2, 2)).to.equal(undefined)
      })

    })

    describe("#set", () => {
      let g = null
      beforeEach(() => {
        g = new Grid(2, 2, "")
      })

      it("returns `this` to allow chaining/inspection", () => {
        expect(g.set(0, 0, "test")).to.equal(g)
      })

      it("sets the value of a position in range properly", () => {
        const randValue = Math.random()
        g.set(1, 1, randValue)

        expect(g.get(1, 1)).to.equal(randValue)
      })

      it("noops on positions out of range", () => {
        g.set(-1, -1, "test")
        g.set(2, 2, "test")
        expect(g.data.length).to.equal(4)
        expect(g.data).to.deep.equal(["", "", "", ""])
      })
    })

    describe("#_getIndexesOfRow", () => {
      const g = new Grid(2, 2, "")

      it("gets an entire row", () => {
        expect(g._getIndexesOfRow(0, 0, 2)).to.deep.equal([0, 1])
      })

      it("discards out of range values", () => {
        expect(g._getIndexesOfRow(0, 0, 3)).to.deep.equal([0, 1])
        expect(g._getIndexesOfRow(-1, 0, 3)).to.deep.equal([0, 1])
        expect(g._getIndexesOfRow(2, 2, 3)).to.deep.equal([])
      })

    })

    describe("#_getIndexesOfRect", () => {
      const g = new Grid(3, 3, "")

      it("gets all indexes with a full-sized rect", () => {
        expect(g._getIndexesOfRect(0, 0, 3, 3)).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7, 8])
      })

      it("gets indexes with a partial-sized rect", () => {
        expect(g._getIndexesOfRect(0, 0, 2, 2)).to.deep.equal([0, 1, 3, 4])
      })

      it("discards out of range values", () => {
        expect(g._getIndexesOfRect(-1, -1, 2, 2)).to.deep.equal([0])
        expect(g._getIndexesOfRect(1, 1, 5, 5)).to.deep.equal([4, 5, 7, 8])
      })

    })

    describe("#setRect", () => {
      let g = null
      beforeEach(() => {
        g = new Grid(3, 3, "z")
      })

      it("returns `this` to allow chaining/inspection", () => {
        expect(g.setRect(0, 0, 1, 1, "test")).to.equal(g)
      })

      it("sets all grid values to 'a'", () => {
        expect(g.setRect(0, 0, 3, 3, "a").data).to.deep.equal("a".repeat(9).split(""))
      })

      it("sets a region to 'a'", () => {
        expect(g.setRect(0, 0, 2, 2, "a").data).to.deep.equal("aazaazzzz".split(""))
      })
    })

  })

  // describe("#adjacentFrom", () => {
  //   const g = new Grid(3, 3, " ")
  //   g.data = g.data.map((_, idx) => String.fromCharCode(65 + idx))
  //
  //   it("returns an object with north, east, south, west keys", () => {
  //     expect(g.adjacentFrom(0, 0)).to.have.keys([
  //       "north",
  //       "east",
  //       "south",
  //       "west"
  //     ])
  //   })
  //
  //   xit("returns proper data for a middle-positioned x/y pair", () => {
  //     expect(g.adjacentFrom(1, 1)).to.deep.equal({ north: "B", east: "F", south: "H", west: "D" })
  //   })
  //
  //   xit("returns nulls for non-contained positions", () => {
  //     expect(g.adjacentFrom(0, 1)).to.deep.equal({ north: "A", east: "E", south: "G", west: undefined })
  //     expect(g.adjacentFrom(2, 1)).to.deep.equal({ north: "C", east: undefined, south: "I", west: "E" })
  //   })
  // })

})

