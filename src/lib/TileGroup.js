/*
 * Taken and modified from https://github.com/nickgravelyn/dungeon/blob/master/room.js
 */

import Rect from "./Rect"

export const TILES = {
  blank: 0,
  wall: 1,
  floor: 2,
  door: 3,
  stairsUp: 4,
  stairsDown: 5,
}

export default class TileGroup extends Rect {
  constructor({ width, height, x = 0, y = 0 }) {
    super({ width, height, x, y })
    this.tiles = new Array(width * height)
  }

  set(x, y, data) {
    const index = positionToIndex({ x, y })
    this.tiles[index] = data
  }

  indexToPosition(index) {
    const y = Math.floor(index / this.size.x)
    const x = index % this.size.y

    return { x, y }
  }

  positionToIndex({ x, y }) {
    return (y * this.size.x) + x
  }

  localContains({ x, y }) {
    const validX = x >= 0 && x < this.size.x
    const validY = y >= 0 && y < this.size.y

    return validX && validY
  }

  globalContains({ x, y }) {
    return this.localContains({
      x: x - this.position.x,
      y: y - this.position.y,
    })
  }

  // callback = function (tile, x, y, idx) : void
  eachTile(callback) {
    this.tiles.forEach((tile, idx) => {
      const { x, y } = this.indexToPosition(idx)
      callback(tile, x, y, idx)
    })
  }

  // callback = function (tile, x, y, idx) : any
  mapTile(callback) {
    return this.tiles.map((tile, idx) => {
      const { x, y } = this.indexToPosition(idx)
      return callback(tile, x, y, idx)
    })
  }

  // callback = function (memo, tile, x, y, idx) : any
  reduceTile(callback, initialValue) {
    return this.tiles.reduce((memo, tile, idx) => {
      const { x, y } = this.indexToPosition(idx)
      return callback(memo, tile, x, y, idx)
    }, initialValue)
  }
}
