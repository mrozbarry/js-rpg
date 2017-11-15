export default class Generator {
  constructor(dungeon) {
    this.dungeon = dungeon
  }

  reset() {
  }

  percentDone() {
    return 0.0
  }

  canGenerate() {
    return false
  }

  generateStep() {
    throw new Error("Generator subclass needs to implement #generateStep()")
  }

  commit() {
    throw new Error("Generator subclass needs to implement #commit()")
  }
}
