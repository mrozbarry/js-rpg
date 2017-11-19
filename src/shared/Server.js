import Dungeon from "./Dungeon"
import { randItem } from "./random"

export default class Server {
  constructor(adapter, timer = performance.now) {
    this.state = {
      dungeon: { width: 0, height: 0, data: [] },
      actors: {},
      state: "ready",
      spawnRoomCells: []
    }

    this.adapter = adapter
    this._timer = timer
    this._tick = this._tick.bind(this)
    this._lastTick = this._timer()
    this._queueTick()
  }

  newDungeon(options) {
    return this.updateState({ dungeon: null, state: "loading", spawnRoomCells: [] })
      .then((payload) => this.adapter.trigger("dungeon", payload))
      .then(() => {
        const newDungeon = new Dungeon({
          seed: (new Date()).toISOString(),
          width: 100,
          height: 100
        })
        newDungeon.setGeneratorOptions(options)
        return newDungeon.generate()
      })
      .then((dungeon) => this.updateState({ dungeon: dungeon }))
      .then((payload) => this.adapter.trigger("dungeon", payload))
      .then(() => this._setSpawnRoom())
      .then(() => this.updateState({
        state: "ready",
        actors: Object.keys(this.state.actors).reduce((nextActors, id) => {
          return {
            ...nextActors,
            [id]: {
              ...nextActors[id],
              position: this._getSpawnPoint()
            }
          }
        }, this.state.actors)
      }))
      .then((payload) => this.adapter.trigger("tick", payload))
  }

  _setSpawnRoom() {
    const { dungeon } = this.state
    const allRoomIds =
      dungeon.data
      .filter((c) => c.meta.isRoom)
      .reduce((ids, cell) => {
        if (ids.indexOf(cell.meta.roomId) >= 0) return ids
        return ids.concat(cell.meta.roomId)
      }, [])
    const spawnRoomId = randItem(dungeon.rnd, allRoomIds)

    return this.updateState({
      spawnRoomCells: dungeon.data.reduce((indexes, cell, idx) => {
        if (cell.meta.isRoom && cell.meta.roomId === spawnRoomId) {
          return indexes.concat(idx)
        }
        return indexes
      }, [])
    })
  }

  updateState(update) {
    this.state = {
      ...this.state,
      ...update
    }

    let triggerable = this._triggerFilter(update)
    if (typeof update.dungeon !== "undefined" && update.dungeon) {
      triggerable.dungeon = triggerable.dungeon.serialize()
    }
    return Promise.resolve(triggerable)
  }

  _triggerFilter(payload) {
    return ["actors", "dungeon", "state"].reduce((filtered, key) => {
      if (typeof payload[key] === "undefined") return filtered
      return { ...filtered, [key]: payload[key] }
    }, {})
  }

  _getSpawnPoint() {
    const index = randItem(this.state.dungeon.rnd, this.state.spawnRoomCells)

    return {
      x: (index % this.state.dungeon.width) + 0.5,
      y: Math.floor(index / this.state.dungeon.width) + 0.5
    }
  }

  handleEvents() {
    return this.adapter.consumeEvent()
      .then((event) => {
        switch(event.type) {
        case "join":
          this.onConnect(event.actorId)
          break

        case "input":
          this.onInput(event.actorId, event.input)
          break

        case "leave":
          this.onDisconnect(event.actorId)
          break
        }
      })
      .then(() => {
        return this.handleEvents()
      })
      .catch((e) => {
        if (e !== "empty") {
          throw e
        }
      })
  }

  onConnect(id) {
    const initialActor = {
      input: { up: false, left: false, down: false, right: false, action: false },
      position: this._getSpawnPoint(),
      online: true
    }

    return this.updateState({
      actors: {
        ...this.state.actors,
        [id]: initialActor
      },
    })
  }

  onDisconnect(actorId) {
    this.updateState({
      actors: Object.keys(this.state.actors).reduce((actors, id) => {
        if (id === actorId) return actors
        return { ...actors, [id]: this.state.actors[id] }
      }, {}),
    })
  }

  onInput(id, input) {
    this.updateState({
      ...this.state,
      actors: {
        ...this.state.actors,
        [id]: {
          ...this.state.actors[id],
          input
        }
      }
    })
  }

  _queueTick() {
    setTimeout(() => {
      this._tick(this._timer())
    }, 30)
  }

  _tick(now) {
    const delta = now - this._lastTick

    this.handleEvents()

    const actorKeys = Object.keys(this.state.actors)
    this.updateState({
      actors: actorKeys.reduce((actors, id) => {
        const actor = this._updateActor(this.state.actors[id], delta)

        return { ...actors, [id]: actor }
      }, {})
    })
      .then((payload) => this.adapter.trigger("tick", payload))

    this._lastTick = now
    this._queueTick()
  }

  _updateActor(actor, delta) {
    if (!actor) return
    const { input, position } = actor
    if (!position) return

    const dx =
      (input.left ? -1 : 0) +
      (input.right ? 1 : 0)

    const dy =
      (input.up ? -1 : 0) +
      (input.down ? 1 : 0)

    const walkSpeed = 1

    if (dx === 0 && dy === 0) return actor

    const affectedDirections =
      []
      .concat(dx === -1 ? "W" : [])
      .concat(dx === 1 ? "E" : [])
      .concat(dy === -1 ? "N" : [])
      .concat(dy === 1 ? "S" : [])


    const targetPosition = {
      x: position.x + (walkSpeed * dx * delta / 1000),
      y: position.y + (walkSpeed * dy * delta / 1000)
    }

    const cell = this.state.dungeon.get(Math.floor(actor.position.x), Math.floor(actor.position.y))
    const nextCell = this.state.dungeon.get(Math.floor(targetPosition.x), Math.floor(targetPosition.y))
    if (cell !== nextCell) {
      const nextPosition = affectedDirections.reduce((pos, direction) => {
        if (cell.hasWalls(direction)) {
          switch(direction) {
          case "N":
          case "S":
            return { ...pos, y: position.y }

          case "E":
          case "W":
            return { ...pos, x: position.x }
          }
        }

        return pos
      }, targetPosition)

      return { ...actor, position: nextPosition }
    }

    return { ...actor, position: targetPosition }
  }
}
