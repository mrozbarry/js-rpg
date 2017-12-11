import { randInt /*, randColour*/ } from "./random"
import Generator from "./Generator"
import { Cell } from "./Grid"

export default class RoomGenerator extends Generator {
  constructor(dungeon, { maxAttempts, minRoomSize = 3, maxRoomSize = 8 }) {
    super(dungeon)

    if (minRoomSize < 2 || typeof minRoomSize !== "number") throw new Error("Room must have a minimum integer value of at least 2")
    if (maxRoomSize < minRoomSize) throw new Error("minRoomSize must be equal to or less than maxRoomSize")

    this.minRoomSize = minRoomSize
    this.maxRoomSize = maxRoomSize
    this.maxAttempts = maxAttempts || 500
    this.reset()
  }

  reset() {
    this.attempt = 0
    this.rooms = []
  }

  percentDone() {
    return this.attempt / this.maxAttempts
  }

  canGenerate() {
    return this.attempt < this.maxAttempts
  }

  generateStep() {
    this.attempt += 1
    const room = this._calculateNextRoom(`r${this.rooms.length}`)
    if (this._roomDoesntIntersectAny(room)) {
      this.rooms.push(room)

      //const colour = randColour(this.dungeon.rnd)
      for(let wx = room.x; wx < room.x + room.w; wx += 1) {
        for(let wy = room.y; wy < room.y + room.h; wy += 1) {
          const wallDirections =
            []
            .concat(wy === (room.y) ? "N" : [])
            .concat(wx === (room.x + room.w - 1) ? "E" : [])
            .concat(wy === (room.y + room.h - 1) ? "S" : [])
            .concat(wx === room.x ? "W" : [])
            .join("")

          const cell = new Cell()
          cell.asFloor(wallDirections)
          //cell.meta.colour = "#BBB"
          cell.meta.isRoom = true
          cell.meta.roomId = this.rooms.length

          this.dungeon.set(wx, wy, cell)
        }
      }
    }
    return this
  }

  _calculateNextRoom(name) {
    const w = randInt(this.dungeon.rnd, this.minRoomSize, this.maxRoomSize + 1)
    const h = randInt(this.dungeon.rnd, this.minRoomSize, this.maxRoomSize + 1)
    const x = randInt(this.dungeon.rnd, 1, this.dungeon.width - w - 1)
    const y = randInt(this.dungeon.rnd, 1, this.dungeon.height - h - 1)

    return { name, x, y, w, h }
  }

  _roomDoesntIntersectAny(_room, padding = 1) {
    if (this.rooms.length === 0) return true

    const inRange = (v, min, max) => ((v >= min) && (v <= max))

    const room = this._rectToXYs(_room, padding)
    return !this.rooms.some((test) => {
      const padded = this._rectToXYs(this._padRoom(test, padding))
      const overX =
        inRange(room.x1, padded.x1, padded.x2) ||
        inRange(padded.x1, room.x1, room.x2)
      const overY =
        inRange(room.y1, padded.y1, padded.y2) ||
        inRange(padded.y1, room.y1, room.y2)

      return overX && overY
    })
  }

  _padRoom(room, padding = 1) {
    const padded = {
      ...room,
      x: room.x - padding,
      y: room.y - padding,
      w: room.w + (padding * 2),
      h: room.h + (padding * 2)
    }

    return padded
  }

  _rectToXYs(room) {
    return {
      x1: room.x,
      y1: room.y,
      x2: room.x + room.w,
      y2: room.y + room.h
    }
  }

}
