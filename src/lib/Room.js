import CellGrid from "./CellGrid"
import * as TILES from "./Tiles"
import rand from "./random"

export default class Room extends CellGrid {
  constructor(width, height) {
    super(width, height)
    this.size = { x: width, y: height }
    this.position = { x: 0, y: 0 }

    this.map((x, y) => {
      if (y == 0 || y == this.size.y - 1 || x == 0 || x == this.size.x - 1) {
        return TILES.wall
      }

      return TILES.floor
    })
  }

  hasStairs() {
    return this.some((x, y, cell) => {
      if ([TILES.stairsDown, TILES.stairsUp].indexOf(cell) >= 0) {
        return true
      }
      return false
    })
  }

  getDoorLocations() {
    var doors = []

    // find all the doors and add their positions to the list
    for (var y = 0; y < this.size.y; y++) {
      for (var x = 0; x < this.size.x; x++) {
        if (this.cells[y][x] == TILES.door) {
          doors.push({ x: x, y: y })
        }
      }
    }

    return doors
  }

  isConnectedTo(room) {
    // iterate the doors in this and see if any are also a door in room
    return this.getDoorLocations().some((door) => {
      const p = {
        x: door.x + this.position.x - room.position.x,
        y: door.y + this.position.y - room.position.y
      }

      if (p.x < 0 || p.x > room.size.x - 1 || p.y < 0 || p.y > room.size.y - 1) {
        return false
      }

      if (room.cells[p.y][p.x] == TILES.door) {
        return true
      }
      return false
    })
  }

  intersects(room) {
    var x1 = this.position.x
    var y1 = this.position.y
    var w1 = this.size.x
    var h1 = this.size.y

    var x2 = room.position.x
    var y2 = room.position.y
    var w2 = room.size.x
    var h2 = room.size.y

    // the +1/-1 here are to allow the rooms one tile of overlap. this is to allow the rooms to share walls
    // instead of always ending up with two walls between the rooms
    if (x1 + w1 <= x2 + 1 || x1 >= x2 + w2 - 1 || y1 + h1 <= y2 + 1 || y1 >= y2 + h2 - 1) {
      return false
    }

    return true
  }

  _directionTo(room) {
    if (this.position.y == room.position.y - this.size.y + 1) {
      return "north"
    }
    else if (this.position.x == room.position.x - this.size.x + 1) {
      return "west"
    }
    else if (this.position.x == room.position.x + room.size.x - 1) {
      return "east"
    }
    else if (this.position.y == room.position.y + room.size.y - 1) {
      return "south"
    }

    return null
  }

  doorLocationTo(room) {
    switch (this._directionTo(room)) {
      case "north":
        return {
          x: rand(
            Math.floor(Math.max(room.position.x, this.position.x) + 1), 
            Math.floor(Math.min(room.position.x + room.size.x, this.position.x + this.size.x) - 1)),
          y: room.position.y
        }

      case "west":    
        return {
          x: room.position.x,
          y: rand(
            Math.floor(Math.max(room.position.y, this.position.y) + 1), 
            Math.floor(Math.min(room.position.y + room.size.y, this.position.y + this.size.y) - 1))
        }

      case "east":    
        return {
          x: this.position.x,
          y: rand(
            Math.floor(Math.max(room.position.y, this.position.y) + 1), 
            Math.floor(Math.min(room.position.y + room.size.y, this.position.y + this.size.y) - 1))
        }

      case "south":    
        return {
          x: rand(
            Math.floor(Math.max(room.position.x, this.position.x) + 1), 
            Math.floor(Math.min(room.position.x + room.size.x, this.position.x + this.size.x) - 1)),
          y: this.position.y
        }
    }

    return { x: -1, y: -1 }
  }
}
