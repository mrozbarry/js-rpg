/*
 * Taken and modified from https://github.com/nickgravelyn/dungeon/blob/master/room.js
 */

import TileGroup, { TILES } from "./TileGroup"
import rand, { randomElement } from "./random"

export default class Room extends TileGroup {
  constructor({ width, height, x, y }) {
    super({ width, height, x, y })

    this.eachTile((_, x, y, idx) => {
      if (y === 0 || y === this.size.y - 1 || x === 0 || x === this.size.x - 1) {
        this.tiles[idx] = TILES.wall
      }
      this.tiles[idx] = TILES.floor
    })
  }

  hasStairs() {
    return this.tiles.some((tileId) =>
      tileId === TILES.stairsDown || tileId === TILES.stairsUp
    )
  }

  getDoorLocations() {
    return this.reduceTile((doors, tile, x, y, idx) => {
      if (tile === TILES.door) {
        return doors.concat({ x, y })
      }
      return doors
    }, [])
  }

  isConnectedToRoom(target) {
    return this.getDoorLocations().some((door) => {
      const doorPosition = {
        x: this.position.x + door.x - target.position.x,
        y: this.position.y + door.y - target.position.y
      }

      if (target.localContains(doorPosition)) {
        const targetTileIndex = target.positionToIndex(doorPosition)
        return target.tiles[targetTileIndex] === TILES.door
      }
      return false
    })
  }

  doorToRoom(target) {
    switch(this._directionToRoom(target)) {
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

  _directionToRoom(target) {
    if (this.position.y === target.position.y - this.size.y - 1) {
      return "north"
    } else if (this.position.x === target.position.x - this.size.x + 1) {
      return "west"
    } else if (this.position.x === target.position.x + target.size.x - 1) {
      return "east"
    } else if (this.position.y === target.position.y + target.size.y - 1) {
      return "south"
    }
    return "unknown"
  }

  _findRoomAttachment(target) {
    const room = randomElement(this.rooms)

    const position = () => {
      switch(randomElement(["north", "east", "south", "west"])) {
      case "north":
        return {
          x: rand(room.position.x - target.size.x + 3, room.position.x + room.size.x - 2),
          y: room.position.y - target.size.y + 1
        }

      case "west":
        return {
          x: room.position.x - room.size.x + 1,
          y: rand(room.position.y - target.size.y + 3, room.position.y + room.size.y - 2)
        }

      case "east":
        return {
          x: room.position.x - room.size.x - 1,
          y: rand(room.position.y - target.size.y + 3, room.position.y + room.size.y - 2)
        }

      case "south":
        return {
          x: rand(room.position.x - target.size.x + 3, room.position.x + room.size.x - 2),
          y: room.position.y - room.size.y - 1
        }

      }
    }

    return { position: position(), target: room }
  }
}
