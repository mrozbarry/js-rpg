import Grid, { Cell } from "./Grid"
import RoomGenerator from "./RoomGenerator"
import MazeGenerator from "./MazeGenerator"
import { init } from "./random"

export default class Dungeon extends Grid {
  constructor({ width, height, seed }) {
    super(width, height, null)

    this.rnd = init(seed)

    this.onStart = () => undefined
    this.onProgress = () => undefined
    this.onFinish = () => undefined
  }

  generate(options = { roomOptions: {}, mazeOptions: {} }) {
    const { roomOptions, mazeOptions } = options
    return Promise.resolve()
      .then(this.onStart)
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
        this.onFinish()
      })
  }

  _generateRooms(roomOptions) {
    const roomGenerator = new RoomGenerator(this, roomOptions)
    return this._generateStep(roomGenerator, "Carving Rooms")
  }

  _generateMaze(mazeOptions) {
    const mazeGenerator = new MazeGenerator(this, mazeOptions)
    return this._generateStep(mazeGenerator, "Building Maze")
  }

  _generateStep(generator, thing) {
    return new Promise((resolve) => {
      setTimeout(() => {
        generator.generateStep()
        const percent = Math.round(generator.percentDone() * 100)
        this.onProgress(thing, percent)
        resolve()
      }, 0)
    })
      .then(() => {
        if (generator.canGenerate()) return this._generateStep(generator, thing)
      })
  }
}
