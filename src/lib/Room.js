/*
 * Taken and modified from https://github.com/nickgravelyn/dungeon/blob/master/room.js
 */

import * as TILES from "./Tiles"
import CellGrid from "./CellGrid"
import rand, { randomElement } from "./random"

export default class Room extends CellGrid {
  constructor({ width, height, x, y }) {
    super({ width, height })
    this.position = { x, y }

    this.map((cellX, cellY) => {
      if (cellY === 0 || cellY === this.size.y - 1 || cellX === 0 || cellX === this.size.x - 1) {
        return TILES.wall
      }
      return TILES.floor
    })
  }

  hasStairs() {
    return this.some((x, y, cell) =>
      cell === TILES.stairsDown || cell === TILES.stairsUp
    )
  }

  getDoorLocations() {
    return this.reduce((doors, x, y, cell) => {
      if (cell === TILES.door) {
        return doors.concat({ x, y })
      }
      return doors
    }, [])
  }

  isConnectedToRoom(target) {
    return this.getDoorLocations().some((doorPosition) => {
      const position = {
        x: this.position.x + door.x - target.position.x,
        y: this.position.y + door.y - target.position.y
      }

      if (target.localContains(position)) {
        return target.cells[position.y][position.x] === TILES.door
      }

      return false
    })
  }

  calculateDoorTo(target) {
    switch(this.directionToRoom(target)) {
    case "north":
      return {
        x: rand(
          Math.floor(Math.max(target.position.x, this.position.x) + 1),
          Math.floor(Math.min(target.position.x + target.size.x, this.position.x + this.size.x) - 1)
        ),
        y: target.position.y
      }

    case "west":
      return {
        x: target.position.x,
        y: rand(
          Math.floor(Math.max(target.position.y, this.position.y) + 1),
          Math.floor(Math.min(target.position.y + target.size.y, this.position.y + this.size.y) - 1)
        )
      }

    case "east":
      return {
        x: this.position.x,
        y: rand(
          Math.floor(Math.max(target.position.y, this.position.y) + 1),
          Math.floor(Math.min(target.position.y + target.size.y, this.position.y + this.size.y) - 1)
        )
      }

    case "south":
      return {
        x: rand(
          Math.floor(Math.max(target.position.x, this.position.x) + 1),
          Math.floor(Math.min(target.position.x + target.size.x, this.position.x + this.size.x) - 1)
        ),
        y: this.position.y
      }
    }

    return { x: -1, y: -1 }
  }

  directionToRoom(target) {
    console.log({ position: this.position, size: this.size }, { position: target.position, size: target.size })
    let direction = null
    if (this.position.y === target.position.y - this.size.y + 1) {
      direction = "north"

    } else if (this.position.x === target.position.x - this.size.x + 1) {
      direction = "west"

    } else if (this.position.x === target.position.x + target.size.x - 1) {
      direction = "east"

    } else if (this.position.y === target.position.y + target.size.y - 1) {
      direction = "south"

    }
    console.log(' ', direction)
    return direction
  }

  _findRoomAttachment(r) {
    let position = { x: -1, y: -1 }

    switch(randomElement(["north", "east", "south", "west"])) {
    case "north":
      position = {
        x: Math.round(rand(r.position.x - this.size.x + 3, r.position.x + r.size.x - 2)),
        y: r.position.y - this.size.y + 1
      }

    case "west":
      position = {
        x: r.position.x - this.size.x + 1,
        y: Math.round(rand(r.position.y - this.size.y + 3, r.position.y + r.size.y - 2))
      }

    case "east":
      position = {
        x: r.position.x - r.size.x - 1,
        y: Math.round(rand(r.position.y - this.size.y + 3, r.position.y + r.size.y - 2))
      }

    case "south":
      position = {
        x: Math.round(rand(r.position.x - this.size.x + 3, r.position.x + r.size.x - 2)),
        y: r.position.y - r.size.y - 1
      }

    }

    return { position, target: r }
  }

  intersects(room) {
    const x1 = this.position.x
    const y1 = this.position.y
    const w1 = this.size.x
    const h1 = this.size.y
    const x2 = room.position.x
    const y2 = room.position.y
    const w2 = room.size.x
    const h2 = room.size.y

    return !(x1 + w1 < x2 + 1 || x1 >= x2 + w2 - 1 || y1 + h1 <= y2 + 1 || y1 >= y2 + h2 - 1)
  }
}
