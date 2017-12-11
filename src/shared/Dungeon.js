import Grid, { Cell } from "./Grid"
import RoomGenerator from "./RoomGenerator"
import MazeGenerator from "./MazeGenerator"
import { init } from "./random"

export default class Dungeon extends Grid {
  static deserialize ({ initializer, generatorOptions }) {
    const d = new Dungeon(initializer)
    d.setGeneratorOptions(generatorOptions)
    return d
  }

  constructor ({ width, height, seed }) {
    super(width, height, null)
    this.seed = seed

    this._wasGenerated = false

    this.rnd = init(seed)
  }

  wasGenerated () {
    return this._wasGenerated
  }

  serialize () {
    const { width, height, seed, generatorOptions } = this
    return { initializer: { width, height, seed }, generatorOptions }
  }

  setGeneratorOptions (options = { roomOptions: {}, mazeOptions: {} }) {
    this.generatorOptions = { ...options }
    this.wasGenerate = false
  }

  generate () {
    const { roomOptions, mazeOptions } = this.generatorOptions
    return Promise.resolve()
      .then(() => {
        if (roomOptions !== false) {
          return this._generateRooms(roomOptions)
        }
      })
      .then(() => {
        if (mazeOptions !== false) {
          return this._generateMaze(mazeOptions)
        }
      })
      .then(() => {
        this._wasGenerated = true
        return this
      })
  }

  _generateRooms (roomOptions) {
    const roomGenerator = new RoomGenerator(this, roomOptions)
    return this._generateStep(roomGenerator, "Carving Rooms")
  }

  _generateMaze (mazeOptions) {
    const mazeGenerator = new MazeGenerator(this, mazeOptions)
    return this._generateStep(mazeGenerator, "Building Maze")
  }

  _generateStep (generator, thing) {
    return new Promise((resolve) => {
      generator.generateStep()
      resolve()
    })
      .then(() => {
        if (generator.canGenerate()) return this._generateStep(generator, thing)
      })
  }
}
