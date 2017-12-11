import Input from "./Input"
import Renderer from "./Renderer"
import Dungeon from "../../shared/Dungeon"
import gameTick, { initialGameState } from "../../shared/Game"
import uuidv4 from "uuid/v4"

export default class Client {
  constructor ({ userId, canvas, firebaseDatabase }) {
    this.state = {}
    this.userId = userId
    this.database = firebaseDatabase

    this.input = new Input()
    this.input.use(Input.presets.arrows)

    this.renderer = new Renderer(canvas)

    this._tick = this._tick.bind(this)
    this.lastTickTime = null
  }


  init () {
    return Promise.resolve()
      .then(() => this.initConnection())
      .then((initialUser) => this.initGame(initialUser))
      .then(() => this.initInput())
      .then(() => this.initDungeon())
      .then(() => this.initRenderer())
      .then(() => requestAnimationFrame(this._tick))
  }


  initConnection () {
    const initialUser = {
      type: "human",
      state: "online",
      input: this.input.state
    }

    return Promise.resolve()
      // .then(() => this._initConnectionWriteUser(initialUser))
      // .then(() => this._initConnectionOnDisconnect())
      .then(() => initialUser)
  }


  _initConnectionWriteUser (initialUser) {
    return this.database
      .ref("actors")
      .child(this.userId)
      .update(initialUser)
  }


  _initConnectionOnDisconnect () {
    this.database
      .ref("actors")
      .child(this.userId)
      .child("state")
      .onDisconnect()
      .set("offline")

    return Promise.resolve()
  }


  initGame (initialUser) {
    this.state = {
      ...initialGameState(() => performance.now()),
      actors: [{
        id: this.userId,
        position: {
          x: 0,
          y: 0,
          dungeonId: ""
        },
        type: "human",
        state: "online",
        input: this.input.state,
      }]
    }

    return Promise.resolve()
  }


  initInput () {
    this.input.onChange = (input) => {
      this.state = {
        ...this.state,
        actors: this.state.actors.map((a) => {
          if (a.id !== this.userId) return a
          return {
            ...a,
            input
          }
        })
      }

      // this.database
      //   .ref("actors")
      //   .child(userId)
      //   .child("input")
      //   .set(input)
    }

    return Promise.resolve()
  }


  initDungeon () {
    const id = uuidv4()
    const dungeon = {
      id,
      dungeon: Dungeon.deserialize({
        initializer: {
          width: 100,
          height: 100,
          seed: id
        },
        generatorOptions: {
          roomOptions: {
            minRoomSize: 2,
            maxRoomSize: 20,
            maxAttempts: 500
          },
          mazeOptions: {
            chanceOfHorizontalSplit: 50,
            chanceOfMultipleVerticalJoins: 50
          }
        }
      })
    }


    return dungeon.dungeon.generate()
      .then(() => {
        this.state = {
          ...this.state,
          dungeons: this.state.dungeons.concat(dungeon),
          initialDungeonId: this.state.initialDungeonId || id
        }
      })
  }


  initRenderer () {
    return this.renderer.init()
      .then(() => {
        const dungeon = this.state.dungeons.find((d) => d.id === this.state.initialDungeonId)
        return this.renderer.setDungeon(dungeon)
      })
  }


  _tick () {
    this.state = gameTick(this.state, this.dungeonObjects)

    this.updateVisibility()
    this.renderer.clear()
    this.renderer.draw(this.state.actors)

    requestAnimationFrame(this._tick)
  }

  updateVisibility() {
    const actor = this.state.actors.find((a) => a.id === this.userId)
    const position = {
      x: actor && actor.position ? actor.position.x : 0,
      y: actor && actor.position ? actor.position.y : 0
    }

    this.renderer.getCamera().move(position)
  }
}
