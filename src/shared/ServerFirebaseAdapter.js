import ServerAdapter from "./ServerAdapter"

export default class ServerFirebaseAdapter extends ServerAdapter {
  constructor(database) {
    super()

    this.database = database

    database.ref("events").remove()
    database.ref("dungeon").remove()

    this.database
      .ref("events")
      .on("child_added", this._appendEvents.bind(this))
  }

  _appendEvents(snapshot) {
    this.events.push(snapshot.val())
    snapshot.ref.remove()
  }

  trigger(eventName, payload) {
    if (payload.actors) {
      const ids = Object.keys(payload.actors)
      ids.forEach((id) => {
        const baseRef =
          this.database
            .ref("actors")
            .child(id)
        baseRef
          .child("position")
          .set(payload.actors[id].position)
      })
    }
    if (payload.dungeon) {
      this.database
        .ref("dungeon")
        .set(payload.dungeon)
    }
    if (payload.state) {
      this.database.ref("state").set(payload.state)
    }
  }
}
