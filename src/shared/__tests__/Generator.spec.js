import Generator from "../Generator"
import { expect } from "chai"

describe("shared/Generator", () => {
  describe(".constructor", () => {
    it("sets the instance dungeon", () => {
      const g = new Generator(123)
      expect(g.dungeon).to.equal(123)
    })
  })

  describe("#reset", () => {
    it("is a function", () => {
      const g = new Generator(123)
      expect(g.reset).to.be.a("function")
    })
  })

  describe("#percentDone", () => {
    it("always returns 0.0", () => {
      const g = new Generator(123)
      expect(g.percentDone()).to.equal(0.0)
    })
  })

  describe("#canGenerate", () => {
    it("always returns false", () => {
      const g = new Generator(123)
      expect(g.canGenerate()).to.not.be.ok
    })
  })

  describe("#generateStep", () => {
    it("throws an error", () => {
      const g = new Generator(123)
      expect(() => g.generateStep()).to.throw("Generator subclass needs to implement #generateStep()")
    })

  })

})
