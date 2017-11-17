import Dungeon from "./Dungeon"
import Broadcaster from "./Broadcaster"

export default class Server extends Broadcaster {
  constructor() {
    super()
    this.state = {
      dungeon: { width: 0, height: 0, data: [] },
      actors: {},
      state: "ready",
      connections: [],
    }
    this._tick = this._tick.bind(this)
    this._lastTick = performance.now()
    this._queueTick()
  }

  newDungeon(options) {
    this.state = { ...this.state, dungeon: null, state: "loading" };
    this.trigger(this.serialize({ includeDungeon: true }), "dungeon")

    const newDungeon = new Dungeon({
      seed: (new Date()).toISOString(),
      width: 100,
      height: 100
    })

    newDungeon
      .generate(options)
      .then((dungeon) => {
        this.state = {
          ...this.state,
          dungeon: dungeon,
          state: "ready"
        }
        this.trigger(this.serialize({ includeDungeon: true }), "dungeon")
      })
  }

  serialize(options = {}) {
    const { includeDungeon } = options
    const { dungeon, actors, state } = this.state
    return includeDungeon ?
      { dungeon: dungeon ? dungeon.serialize() : null, actors, state } :
      { actors, state }
  }

  onConnect(info = {}) {
    const id = (new Date()).toISOString()
    return new Promise((resolve) => {
      const initialActor = {
        input: { up: false, left: false, down: false, right: false, action: false },
        position: { x: 0, y: 0 },
        // xp: 0,
        // health: [5, 5]
      }

      this.state = {
        ...this.state,
        actors: {
          ...this.state.actors,
          [id]: initialActor
        },
        connections: this.state.connections
          .concat({
            ...info,
            actorId: id
          })
      }
      this.trigger(this.serialize(), "join")
      resolve(id)
    })
  }

  onDisconnect(actorId) {
    this.state = {
      ...this.state,
      actors: Object.keys(this.state.actors).reduce((actors, id) => {
        if (id === actorId) return actors
        return { ...actors, [id]: this.state.actors[id] }
      }, {}),
      connections: this.state.connections.filter((conn) => conn.actorId !== actorId),
    }
    this.trigger(this.serialize(), "part")
  }

  onInput(id, input) {
    this.state = {
      ...this.state,
      actors: {
        ...this.state.actors,
        [id]: {
          ...this.state.actors[id],
          input
        }
      }
    }
  }

  _queueTick() {
    setTimeout(() => {
      this._tick(performance.now())
    }, 5)
  }

  _tick(now) {
    const delta = now - this._lastTick

    this.state = {
      ...this.state,
      actors: Object.keys(this.state.actors).reduce((actors, id) => {
        const actor = this._updateActor(this.state.actors[id], delta)

        return { ...actors, [id]: actor }
      }, {})
    }
    this.trigger(this.serialize(), "tick")

    this._lastTick = now
    this._queueTick()
  }

  _updateActor(actor, delta) {
    const { input, position } = actor

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
