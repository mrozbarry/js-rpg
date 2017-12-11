import gameTick, { initialGameState } from "../../shared/Game"
import Dungeon from "../../shared/Dungeon"

export default class Server {
  constructor(firebaseDatabase) {
    this.state = null
    this.initialDungeonId = null

    this.database = firebaseDatabase

    this._tick = this._tick.bind(this)

    this._refValueHandlers = {}
  }


  _addRefValueHandler(name, ref, fn) {
    ref.on("value", fn)
    this._refValueHandlers[name] = () => ref.off("value", fn)
  }


  _removeRefValueHandler(name) {
    this._refValueHandlers[name]()
    delete this._refValueHandlers[name]
  }


  isServerAvailable () {
    return this.database
      .ref("state")
      .once("value")
      .then((snapshot) => {
        return snapshot.val() === "offline"
      })
      .catch(() => {
        return false
      })
  }


  init (timer) {
    return this.isServerAvailable()
      .then((serverAvailable) => {
        if (!serverAvailable) throw new Error("Server unavailable")
        return this.database
          .ref("state").set("online")
          .then(() => {
            this.database
              .ref("state")
              .onDisconnect()
              .set("offline")
          })

      })
      .then(() => this.initGame(timer))
      .then(this.initListeners.bind(this))
      .then(this.queueTick.bind(this))
  }


  initGame (timer) {
    this.state = initialGameState(timer)
  }


  initListeners () {
    this.initDungeonListeners()
    this.initActorListeners()
  }


  initDungeonListeners () {
    this.database
      .ref("dungeons")
      .on("child_added", (snapshot) => {
        const alreadyAdded = this.state.dungeons.find((d) => d.id === snapshot.key)
        if (!alreadyAdded) this.handleNewDungeon(snapshot.key, snapshot.value().dungeon)
      })

    return this.database
      .ref("dungeons")
      .once("value", (snapshot) => {
        if (!snapshot.exists()) {
          this.pushNewDungeon()
        }
      })
  }


  handleNewDungeon (id, params) {
    const dungeon = Dungeon.deserialize(params)
    return this.importDungeon(id, dungeon)
  }


  importDungeon (id, dungeon) {
    const dungeonsRef = this.database.ref("dungeons")

    dungeon.id = id
    return dungeon.generate()
      .then(() => {
        this.state.dungeons = this.state.dungeons.concat(dungeon)
        this.setInitialDungeonIfEmpty(id)
      })
  }


  pushNewDungeon () {
    const dungeonsRef = this.database.ref("dungeons")

    const dungeonId = dungeonsRef.push().key

    const dungeon = new Dungeon({ width: 100, height: 100, seed: dungeonId })
    dungeon.setGeneratorOptions({
      roomOptions: {
        minRoomSize: 2,
        maxRoomSize: 15,
        maxAttempts: 500
      },
      mazeOptions: {
        chanceOfHorizontalSplit: 50,
        chanceOfMultipleVerticalJoins: 50,
      }
    })

    return dungeon.generate()
      .then(() => this.importDungeon(dungeonId, dungeon))
      .then(() => dungeonsRef.child(dungeonId).child("dungeon").set(dungeon.serialize()))
  }


  setInitialDungeonIfEmpty (id) {
    const initialDungeonRef = this.database.ref("initialDungeonId")

    return initialDungeonRef
      .once("value")
      .then((snapshot) => {
        if (!snapshot.exists()) {
          initialDungeonRef.set(id)
          this.initialDungeonId = id
        } else {
          this.initialDungeonId = snapshot.val()
        }
      })
  }


  initActorListeners () {
    const actorsQuery = this.database
      .ref("actors")
      .orderByChild("state")
      .equalTo("online")

    actorsQuery
      .on("child_added", (snapshot) => {
        const id = snapshot.key
        this.addActor(id, snapshot.value())

        this._addRefValueHandler(
          `actor/${id}/input`,
          snapshot.ref.child("input"),
          (inputSnapshot) => this.handleInput(id, inputSnapshot.value())
        )
      })

    actorsQuery
      .on("child_removed", (snapshot) => {
        const id = snapshot.key

        this.removeActor(id)

        this._removeRefValueHandler(`actor/${id}/input`)
      })
  }


  handleInput (actorId, input) {
    this.state = {
      ...this.state,
      actors: {
        ...this.state.actors,
        [actorId]: {
          ...this.state.actors[actorId],
          input: input
        }
      }
    }
  }


  addActor (id, actor) {
    const position = actor.position || {
      dungeonId: this.initialDungeonId,
      // TODO: Maybe determine a good spawn point?
      x: 0,
      y: 0
    }

    this.state = {
      ...this.state,
      actors: {
        ...this.state.actors,
        [id]: {
          ...actor,
          position
        }
      }
    }

    if (!actor.position) this.updateActorPosition(id, position)
  }


  removeActor (id) {
    this.state = { ...this.state }
    delete this.state.actors[id]
  }


  updateActorPosition (id, position) {
    return this.database
      .ref("actors")
      .child(id)
      .child("position")
      .set(position)
  }


  queueTick() {
    if (this._queueTickTimeout) {
      clearTimeout(this._queueTickTimeout)
      this._queueTickTimeout = null
    }

    this._queueTickTimeout = setTimeout(() => {
      this._queueTickTimeout = null
      this._tick(this.state.timerFn())
    }, 1)
  }


  _tick(now) {
    this.state = gameTick(this.state)
    this.queueTick()
  }
}
