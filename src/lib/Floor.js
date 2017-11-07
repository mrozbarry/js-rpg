/*
 * Taken and modified from https://github.com/nickgravelyn/dungeon/blob/master/dungeon.js
 */

import * as TILES from "./Tiles"
import CellGrid from "./CellGrid"
import Room from "./Room"
import rand, { randomElement } from "./random"

export default class Floor {
  constructor(options) {
    this.size = {
      x: options.size.x,
      y: options.size.y
    }

    this.options = {
      minRoomSize: 5,
      maxRoomSize: 15,
      maxNumRooms: 50,
      maxRoomArea: 150,
      addStairsUp: true,
      addStairsDown: true,
      ...options
    }
    this.rooms = []
  }

  getStairs() {
    return this.rooms.reduce((stairs, room) => {
      if (stairs.up !== null && stairs.down !== null) {
        return stairs
      }

      if (room.hasStairs()) {
        return room.reduce((memo, x, y, cell, idx) => {
          const position = { x: room.pos.x + x, y: room.pos.y + y }

          if (tile === TILES.stairsUp) {
            return { ...memo, up: position }
          } else if (tile === TILES.stairsDown) {
            return { ...memo, down: position }
          }
          return memo
        }, stairs)
      }
      return stairs
    }, { up: null, down: null })
  }

  generate() {
    this.rooms = []
    this.roomGrid = new CellGrid({ width: this.size.x, height: this.size.y })
    this.roomGrid.map(() => [])

    const room = this._createRandomRoom()
    room.position = {
      x: Math.floor(this.size.x / 2) - Math.floor(room.size.x / 2),
      y: Math.floor(this.size.y / 2) - Math.floor(room.size.y / 2)
    }
    this.addRoom(room)

    let iter = this.options.maxNumRooms * 5
    while ((this.maxNumRooms <= 0 || this.rooms.length < this.options.maxNumRooms) && iter-- > 0) {
      this._generateRoom()
    }

    this.rooms.forEach((room, idx1) => {
      const targets = this._getPotentiallyTouchingRooms(room)

      targets.forEach((target, idx2) => {
        if (!room.isConnectedToRoom(target)) {
          if (Math.random() < 0.2) {
            this._addDoor(room.calculateDoorTo(target))
          }
        }
      })
    })

    if (this.options.addStairsDown) {
      this._addStairs(TILES.stairsDown)
    }
    if (this.options.addStairsUp) {
      this._addStairs(TILES.stairsUp)
    }
  }

  addRoom(room) {
    if (!this._canFitRoom(room)) {
      return false
    }
    this.rooms.push(room)

    for(let y = room.position.y; y < room.position.y + room.size.y; y++) {
      for(let x = room.position.x; x < room.position.x + room.size.x; x++) {
        console.log(x, this.roomGrid.cells[y])
        this.roomGrid.cells[y][x].push(room)
      }
    }

    return true
  }

  _addDoor(position) {
    this.roomGrid.cells[position.y][position.x].forEach((room) => {
      const x = position.x - room.position.x
      const y = position.y - room.position.y
      room.cells[y][x] = TILES.door
    })
  }

  _createRandomRoom() {
    let width = 0
    let height = 0
    let area = 0

    do {
      width = Math.round(rand(this.options.minRoomSize, this.options.maxRoomSize))
      height = Math.round(rand(this.options.minRoomSize, this.options.maxRoomSize))
      area = width * height
    } while (this.options.maxRoomArea > 0 && area > this.options.maxRoomArea)

    return new Room({ width, height })
  }

  _generateRoom() {
    const room = this._createRandomRoom()
    for(let attempt = 0; attempt < 150; attempt++) {
      const target = randomElement(this.rooms)
      const r = room._findRoomAttachment(target)
      room.position = r.position

      if (this.addRoom(room)) {
        this._addDoor(room.calculateDoorTo(target))
        break
      }
    }
  }

  _canFitRoom(room) {
    if (room.position.x < 0 || room.position.x + room.size.x > this.size.x - 1) return false
    if (room.position.y < 0 || room.position.y + room.size.y > this.size.y - 1) return false

    return this.rooms.every((otherRoom) => !room.intersects(otherRoom))
  }

  _getPotentiallyTouchingRooms(room) {
    let touchingRooms = []

    const checkRoomList = (x, y) => {
      this.roomGrid.cells[y][x].forEach((r) => {
        if (r !== room && touchingRooms.indexOf(r) === -1) {
          const lx = x - r.position.x
          const ly = y - r.position.y
          if ((lx > 0 && lx < r.size.x - 1) || (ly > 0 && ly < r.size.y - 1)) {
            touchingRooms.push(r)
          }
        }
      })
    }

    for(let x = room.position.x + 1; x < room.position.x + room.size.x - 1; x++) {
      checkRoomList(x, room.position.y)
      checkRoomList(x, room.position.y + room.size.y - 1)
    }

    for(let y = room.position.y + 1; y < room.position.y + room.size.y - 1; y++) {
      checkRoomList(room.position.x, y)
      checkRoomList(room.position.x + room.size.x - 1, y)
    }

    return touchingRooms
  }

  _addStairs (tile) {
    let room = null
    do {
      room = randomElement(this.rooms)
    } while (room.getDoorLocations().length > 1 || room.hasStairs())

    const candidates = room.reduce((memo, x, y, cell) => {
      if (cell !== TILES.floor) return memo

      const doorAbove = room.cells[y - 1][x] === TILES.door
      const doorBelow = room.cells[y + 1][x] === TILES.door
      const doorLeft = room.cells[y][x - 1] == TILES.door
      const doorRight = room.cells[y][x + 1] == TILES.door
      if (doorAbove || doorBelow || doorLeft || doorRight) return memo

      return memo.concat({ x, y })
    }, [])

    console.log('_addStairs', candidates)

    const loc = randomElement(candidates)
    console.log(' ', loc)
    room.cells[loc.y][loc.x] = tile
  }
}
