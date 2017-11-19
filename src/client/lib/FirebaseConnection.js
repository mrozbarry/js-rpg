import Connection from "./Connection"
import Dungeon from "../../shared/Dungeon"

export default class FirebaseConnection extends Connection {
  constructor(firebase) {
    super()
    this.actorId = null
    this.firebase = firebase
  }

  connect() {
    const { actorId } = this
    if (actorId) return

    this._firebaseOnListeners()

    const { currentUser } = this.firebase.auth()

    this.actorId = currentUser.uid
    this._pushEvent("join", { actorId: currentUser.uid })
    this.firebase.database()
      .ref("actors")
      .child(this.actorId)
      .child("online")
      .set(true)
    this.firebase.database()
      .ref("actors")
      .child(this.actorId)
      .child("online")
      .onDisconnect()
      .set(false)
  }

  updateState(update) {
    this.state = {
      ...this.state,
      ...update
    }
  }

  _firebaseOnListeners() {
    const database = this.firebase.database()

    this._updateActors = database
      .ref("actors")
      .orderByChild("online")
      .equalTo(true)
      .on("value", (snapshot) => {
        this.updateState({
          actors: snapshot.val()
        })
      })

    this._updateState = database
      .ref("state")
      .on("value", (snapshot) => {
        this.updateState({
          state: snapshot.val()
        })
      })

    this._updateDungeon = database
      .ref("dungeon")
      .on("value", (snapshot) => {
        let dungeon = snapshot.val()
        if (dungeon) {
          dungeon = Dungeon.deserialize(dungeon)
          dungeon.generate()
        }
        this.updateState({
          dungeon
        })
      })
  }

  disconnect() {
    const { actorId } = this
    if (!actorId) return
    this.actorId = null
    this._pushEvent("part", { actorId })
    this._firebaseOffListeners()
  }


  _firebaseOffListeners() {
    const database = this.firebase.database()
    database
      .ref("actors")
      .orderByChild("online")
      .equalTo(true)
      .off("value", this._updateActors)

    database
      .ref("state")
      .off("value", this._updateState)

    database
      .ref("dungeon")
      .off("value", this._updateDungeon)
  }


  sendInput(input) {
    const { actorId } = this
    this._pushEvent("input", { actorId, input })
  }


  _pushEvent(type, payload) {
    const { actorId } = this
    this.firebase
      .database()
      .ref("events")
      .push({ ...payload, actorId, type })
  }
}
