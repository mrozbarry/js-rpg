import rand, { randomElement } from "./random"
import CellGrid from "./CellGrid"
import Room from "./Room"
import * as TILES from "./Tiles"

export default class Dungeon {
  constructor(width, height) {
    this.size = { x: width, y: height }
    this.minRoomSize = 5
    this.maxRoomSize = 15
    this.maxNumRooms = 50
    this.maxRoomArea = 150
    
    this.addStairsUp = true
    this.addStairsDown = true
    
    this.rooms = []
    this.roomGrid = new CellGrid(this.size.x, this.size.y)
  }

  getStairs() {
    var result = { up: null, down: null }
    for (var i = 0; i < this.rooms.length; i++) {
      var r = this.rooms[i]

      if (r.hasStairs()) {
        for (var y = 0; y < r.size.y; y++) {
          for (var x = 0; x < r.size.x; x++) {
            if (r.cells[y][x] == TILES.stairsUp) {
              result.up = { x: r.position.x + x, y: r.position.y + y }
            }
            else if (r.cells[y][x] == TILES.stairsUp) {
              result.down = { x: r.position.x + x, y: r.position.y + y }
            }
          }
        }
      }
    }
    return result
  }

  generate() {
    // clear
    this.rooms = [ ]
    this.roomGrid.map(() => [])

    // seed the map with a starting randomly sized room in the center of the map
    var room = this.createRandomRoom()                
    room.position = {
      x: Math.floor(this.size.x / 2) - Math.floor(room.size.x / 2),
      y: Math.floor(this.size.y / 2) - Math.floor(room.size.y / 2)
    }            
    this.addRoom(room)

    // continue generating rooms until we hit our cap or have hit our maximum iterations (generally
    // due to not being able to fit any more rooms in the map)
    var iter = this.maxNumRooms * 5
    while ((this.maxNumRooms <= 0 || this.rooms.length < this.maxNumRooms) && iter-- > 0) { 
      this.generateRoom()
    }

    // now we want to randomly add doors between some of the rooms and other rooms they touch
    for (var i = 0; i < this.rooms.length; i++) {
      // find all rooms that we could connect with this one
      var targets = this.getPotentiallyTouchingRooms(this.rooms[i])
      for (var j = 0; j < targets.length; j++) {                    
        // make sure the rooms aren't already connected with a door
        if (!this.rooms[i].isConnectedTo(targets[j])) {
          // 20% chance we add a door connecting the rooms
          if (Math.random() < 0.2) {
            this.addDoor(this.rooms[i].doorLocationTo(targets[j]))
          }
        }
      }
    }

    // add stairs if desired
    if (this.addStairsDown) {
      this.addStairs(TILES.stairsDown)
    }
    if (this.addStairsUp) {
      this.addStairs(TILES.stairsUp)
    }
  }

  getFlattenedTiles() {
    // create the full map for the whole dungeon
    var tiles = Array(this.size.y)
    for (var y = 0; y < this.size.y; y++) { 
      tiles[y] = Array(this.size.x) 
      for (var x = 0; x < this.size.x; x++) {
        tiles[y][x] = null
      }
    }

    // fill in the map with details from each room
    for (var i = 0; i < this.rooms.length; i++) {
      var r = this.rooms[i]            
      for (var y = 0; y < r.size.y; y++) {
        for (var x = 0; x < r.size.x; x++) {
          // no need to make objects for blank tiles
          if (r.cells[y][x] != 0) {
            // the tiles we give back are objects with some extra data
            tiles[y + r.position.y][x + r.position.x] = {
              type: r.cells[y][x],
              hasBeenSeen: false
            }
          }
        }
      }
    }

    // return the map to the caller
    return tiles
  }

  getCollisionMap() {
    // create the full collision map for the whole dungeon
    var collisionMap = Array(this.size.y)
    for (var y = 0; y < this.size.y; y++) { 
      collisionMap[y] = Array(this.size.x) 
      for (var x = 0; x < this.size.x; x++) {
        collisionMap[y][x] = 0
      }
    }

    // fill in the collision map with details from each room
    for (var i = 0; i < this.rooms.length; i++) {
      var r = this.rooms[i]            
      for (var y = 0; y < r.size.y; y++) {
        for (var x = 0; x < r.size.x; x++) {
          var value = 0
          switch (r.cells[y][x]) {
            case TILES.wall:
              value = 1
              break
            case TILES.stairsUp:
              value = 2
              break
            case TILES.stairsDown:
              value = 3
              break
          }

          collisionMap[y + r.position.y][x + r.position.x] = value
        }
      }
    }

    // return the map to the caller
    return collisionMap
  }

  canFitRoom(room) {
    // make sure the room fits inside the dungeon
    if (room.position.x < 0 || room.position.x + room.size.x > this.size.x - 1) { return false }
    if (room.position.y < 0 || room.position.y + room.size.y > this.size.y - 1) { return false }

    // make sure this room doesn't intersect any existing rooms
    for (var i = 0; i < this.rooms.length; i++) {
      var r = this.rooms[i]
      if (room.intersects(r)) {
        return false
      }
    }

    return true
  }

  getPotentiallyTouchingRooms(room) {
    var touchingRooms = []

    // function that checks the list of rooms at a point in our grid for any potential touching rooms
    var checkRoomList = (x, y,) => {
      var r = this.roomGrid.cells[y][x]
      for (var i = 0; i < r.length; i++) {
        // make sure this room isn't the one we're searching around and that it isn't already in the list
        if (r[i] != room && touchingRooms.indexOf(r[i]) < 0) {
          // make sure this isn't a corner of the room (doors can't go into corners)
          var lx = x - r[i].position.x
          var ly = y - r[i].position.y
          if ((lx > 0 && lx < r[i].size.x - 1) || (ly > 0 && ly < r[i].size.y - 1)) {
            touchingRooms.push(r[i])
          }
        }
      }
    }

    // iterate the north and south walls, looking for other rooms in those tile locations            
    for (var x = room.position.x + 1; x < room.position.x + room.size.x - 1; x++) {
      checkRoomList(x, room.position.y)
      checkRoomList(x, room.position.y + room.size.y - 1)
    }

    // iterate the west and east walls, looking for other rooms in those tile locations
    for (var y = room.position.y + 1; y < room.position.y + room.size.y - 1; y++) {
      checkRoomList(room.position.x, y)
      checkRoomList(room.position.x + room.size.x - 1, y)
    }

    return touchingRooms
  }

  findNewDoorLocation(room1, room2) {
    var doorPos = { x: -1, y: -1 }

    // figure out the direction from room1 to room2
    var dir = -1

    // north
    if (room1.position.y == room2.position.y - room1.size.y + 1) {
      dir = 0
    }
    // west
    else if (room1.position.x == room2.position.x - room1.size.x + 1) {
      dir = 1
    }
    // east
    else if (room1.position.x == room2.position.x + room2.size.x - 1) {
      dir = 2
    }
    // south
    else if (room1.position.y == room2.position.y + room2.size.y - 1) {
      dir = 3
    }

    // use the direction to find an appropriate door location
    switch (dir) {
        // north
      case 0:
        doorPos.x = rand(
          Math.floor(Math.max(room2.position.x, room1.position.x) + 1), 
          Math.floor(Math.min(room2.position.x + room2.size.x, room1.position.x + room1.size.x) - 1))
        doorPos.y = room2.position.y
        break
        // west
      case 1:    
        doorPos.x = room2.position.x
        doorPos.y = rand(
          Math.floor(Math.max(room2.position.y, room1.position.y) + 1), 
          Math.floor(Math.min(room2.position.y + room2.size.y, room1.position.y + room1.size.y) - 1))
        break
        // east
      case 2:    
        doorPos.x = room1.position.x
        doorPos.y = rand(
          Math.floor(Math.max(room2.position.y, room1.position.y) + 1), 
          Math.floor(Math.min(room2.position.y + room2.size.y, room1.position.y + room1.size.y) - 1))
        break
        // south
      case 3:    
        doorPos.x = rand(
          Math.floor(Math.max(room2.position.x, room1.position.x) + 1), 
          Math.floor(Math.min(room2.position.x + room2.size.x, room1.position.x + room1.size.x) - 1))
        doorPos.y = room1.position.y
        break
    }

    return doorPos
  }

  findRoomAttachment(room) {
    // pick a room, any room
    var r = randomElement(this.rooms)

    var position = { x: 0, y: 0 }

    // randomly position this room on one of the sides of the random room
    switch (randomElement(["north", "west", "east", "south"])) {
      case "north":
        position.x = rand(r.position.x - room.size.x + 3, r.position.x + r.size.x - 2)
        position.y = r.position.y - room.size.y + 1
        break
      case "west":
        position.x = r.position.x - room.size.x + 1
        position.y = rand(r.position.y - room.size.y + 3, r.position.y + r.size.y - 2)
        break
      case "east":
        position.x = r.position.x + r.size.x - 1
        position.y = rand(r.position.y - room.size.y + 3, r.position.y + r.size.y - 2)
        break
      case "south":
        position.x = rand(r.position.x - room.size.x + 3, r.position.x + r.size.x - 2)
        position.y = r.position.y + r.size.y - 1
        break
    }

    // return the position for this new room and the target room
    return {
      position: position,
      target: r
    }
  }

  addRoom(room) { 
    // if the room won't fit, we don't add it
    if (!this.canFitRoom(room)) { return false }

    // add it to our main rooms list
    this.rooms.push(room)

    // update all tiles to indicate that this room is sitting on them. this grid is used
    // when placing doors so all rooms in a space can be updated at the same time.
    for (var y = room.position.y; y < room.position.y + room.size.y; y++) {
      for (var x = room.position.x; x < room.position.x + room.size.x; x++) {
        this.roomGrid.cells[y][x].push(room)
      }
    }

    return true
  }

  addDoor(doorPos) {
    // get all the rooms at the location of the door
    var rooms = this.roomGrid.cells[doorPos.y][doorPos.x]
    for (var i = 0; i < rooms.length; i++) {
      var r = rooms[i]

      // convert the door position from world space to room space
      var x = doorPos.x - r.position.x
      var y = doorPos.y - r.position.y

      // set the tile to be a door
      r.cells[y][x] = TILES.door
    }
  }

  createRandomRoom() {
    let width = 0
    let height = 0
    let area = 0            

    // find an acceptable width and height using our min/max sizes while keeping under
    // the maximum area
    do {
      width = rand(this.minRoomSize, this.maxRoomSize)
      height = rand(this.minRoomSize, this.maxRoomSize)
      area = width * height
    } while (this.maxRoomArea > 0 && area > this.maxRoomArea)

    // create the room
    return new Room(width, height)
  }

  generateRoom() {
    // create the randomly sized room
    let room = this.createRandomRoom()

    // only allow 150 tries at placing the room
    let iter = 150
    while (iter-- > 0) {
      // attempt to find another room to attach this one to
      const result = this.findRoomAttachment(room)

      // update the position of this room
      room.position = result.position

      // try to add it. if successful, add the door between the rooms and break the loop
      if (this.addRoom(room)) {
        this.addDoor(room.doorLocationTo(result.target))
        break 
      }
    }
  }

  addStairs(type) {
    let room = null

    // keep picking random rooms until we find one that has only one door and doesn't already have stairs in it
    do { room = randomElement(this.rooms) } 
    while (room.getDoorLocations().length > 1 || room.hasStairs())

    // build a list of all locations in the room that qualify for stairs
    var candidates = [ ]
    for (var y = 1; y < room.size.y - 2; y++) {
      for (var x = 1; x < room.size.x - 2; x++) {
        // only put stairs on the floor
        if (room.cells[y][x] != TILES.floor) { continue }

        // make sure this floor isn't right next to a door
        if (room.cells[y - 1][x] == TILES.door ||
          room.cells[y + 1][x] == TILES.door ||
          room.cells[y][x - 1] == TILES.door ||
          room.cells[y][x + 1] == TILES.door) { continue }

        // add it to the candidate list
        candidates.push({ x: x, y: y })
      }
    }

    // pick a random candidate location and make it the stairs
    var loc = randomElement(candidates)
    room.cells[loc.y][loc.x] = type
  }
}
