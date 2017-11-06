/*
 * Taken and modified from https://github.com/nickgravelyn/dungeon/blob/master/dungeon.js
 */

import Size from "./Size"

class Floor extends Size {
  constructor(options) {
    super(options)

    this.options = {
      minRoomSize: 5,
      maxRoomSize: 15,
      maxNumRooms: 50,
      maxRoomArea: 150,
      addStairsUp: true,
      addStairsDown: true
      ...options
    }
    this.rooms = []
    this.tiles = new TileGroup({ width: 1, height: 1 })
    this.collisionMap = []
  }

  addRoom(room) {
    if (!this._canFitRoom(room)) {
      return false
    }
    this.rooms.push(room)
    return true
  }

  _cacheMap() {
    this._setTiles()
    this._setCollisionMap()
  }

  _setTiles() {
    this.tiles = this.rooms.reduce((worldTiles, room) => {
      return room.reduceTile((tiles, x, y, tile, idx) => {
        if (tile !== TILES.blank) {
          tiles.set(x + room.position.x, y + room.position.y, tile)
        } else {
          tiles.set(x + room.position.x, y + room.position.y, undefined)
        }
        return tiles
      }, worldTiles)
    }, this.tiles)
  }

  _setCollisionMap() {
    const collidable = [TILES.wall, TILES.stairsUp, TILES.stairsDown]
    this.collisionMap = this.tiles.reduceTile((map, tile, x, y) => {
      map.set(x, y, collidable.indexOf(tile) >= 0 ? tile : 0)
      return map
    }, new TileGroup({ width: this.size.x, height: this.size.y }))
  }


  getStairs() {
    return this.rooms.reduce((stairs, room) => {
      if (stairs.up !== null && stairs.down !== null) {
        return stairs
      }

      if (room.hasStairs()) {
        return room.reduceTile((memo, x, y, tile, idx) => {
          const position = { x: room.pos.x + x, y: room.pos.y + y }
          if (tile === Tiles.StairsUp) {
            return { ...memo, up: position }
          } else if (tile === Tiles.StairsDown) {
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
    this.tiles = []
    this.collisionMap = []

    const room = this._createRandomRoom()
    room.position = {
      x: Math.floor(this.size.x / 2) - Math.floot(room.size.x / 2),
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
            this._addDoor(this._findNewDoorLocation(room, target), [idx1, idx2])
          }
        }
      })
    })

    if (this.options.addStairsDown) {
      this._addStairs(Tiles.StairsDown)
    }
    if (this.options.addStairsUp) {
      this._addStairs(Tiles.StairsUp)
    }
  }

  _addDoor(position, roomIndexes) {
    roomIndexes.forEach((idx) => {
      const pos = {
        x: position.x - this.rooms[idx].x,
        y: position.y - this.rooms[idx].y
      }
      this.rooms[idx].set(pos.x, pos.y, TILES.door)
    })
  }

  _createRandomRoom() {
    let size = new Size({ width: 0, height: 0 })
    while (true) {
      size = new Size({
        width: rand(this.options.minRoomSize, this.options.maxRoomSize),
        height: rand(this.options.minRoomSize, this.options.maxRoomSize),
      })

      if (this.options.maxRoomArea > 0 && size.area() > this.maxRoomArea) {
        break
      }
    }

    return new Room({
      width: size.size.x,
      height: size.size.y
    })
  }

  _generateRoom() {
    const room = this._createRandomRoom()
    for(let attempt = 0; attempt < 150; attempt++) {
      const r = this._findRoomAttachment(room)
      room.position = r.position
      if (this.addRoom(room)) {
        this._addDoor()
      }
    }
  }

  _findNewDoorLocation(room, target) {
  }

  _canFitRoom(room) {
    const tooBigX = room.position.x < 0 || room.position.x + room.size.x > this.size.x - 1
    const tooBigY = room.position.y < 0 || room.position.y + room.size.y > this.size.y - 1
    if (tooBigX || tooBigY) {
      return false
    }
    return this.rooms.all((placedRoom) => !placedRoom.intersects(room))
  }

  _getPotentiallyTouchingRooms(room) {
    const otherRooms = this.rooms.filter((otherRoom) => otherRoom !== room)
    const touchingRooms = otherRooms.filter((otherRoom) => {
      return otherRoom.sharesBoundary(room)
    })
  }
}
