import { randInt, randItem, hash, init } from "../random"
import { expect } from "chai"

describe("shared/random", () => {
  describe("hash", () => {
    it("converts a string to a number", () => {
      expect(hash("")).to.be.a("number")
    })

    it("converts foo to 193491849", () => {
      expect(hash("foo")).to.equal(193491849)
    })
  })

  describe("init", () => {
    it("takes a string seed, and creates an instance of fastRandom", () => {
      const r = init("foo")
      expect(r.nextInt).to.be.a("function")
      expect(r.nextFloat).to.be.a("function")
      expect(r.seed).to.be.a("function")
    })
  })

  describe("methods using fastRandom", () => {
    let generator = null

    beforeEach(() => {
      generator = init("foo")
    })

    describe("randInt", () => {
      it("throws if nothing is passed", () => {
        expect(() => randInt()).to.throw
      })

      it("throws when rnd is passed, but no numbers", () => {
        expect(() => randInt(generator)).to.throw("randInt takes at least rnd and a number")
      })

      it("returns 0 when rnd and 0 are passed", () => {
        expect(randInt(generator, 0)).to.equal(0)
      })

      it("takes the last two params and min and max values", () => {
        const min = 1
        const max = 3
        for(let i = 0; i < 100; i++) {
          expect(randInt(generator, min, max)).to.be.oneOf([1, 2, 3])
        }
      })
    })

    describe("randItem", () => {
      it("throws if nothing is passed", () => {
        expect(() => randItem()).to.throw
      })

      it("throws if only rnd is passed", () => {
        expect(() => randItem(generator)).to.throw
      })

      it("picks a random item out of an array", () => {
        const options = ["foo", 3.14, "bar", true, "baz"]
        for(let i = 0; i < 100; i++) {
          expect(randItem(generator, options)).to.be.oneOf(options)
        }

      })
    })

    describe("randShuffle", () => {
    })

    describe("randColour", () => {
    })
  })

})
