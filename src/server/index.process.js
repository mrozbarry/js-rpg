import * as firebase from "firebase"
import Server from "../shared/Server"
import ServerFirebaseAdapter from "../shared/ServerFirebaseAdapter"

firebase.initializeApp({
  apiKey: "AIzaSyAft80pWp2Lq_IIuzAgIgjBsLIs6TaeqU0",
  authDomain: "js-rpg-3ee33.firebaseapp.com",
  databaseURL: "https://js-rpg-3ee33.firebaseio.com",
  projectId: "js-rpg-3ee33"
})

console.log("Starting js-rpg server process.")
console.log("Using firebase", firebase.app().options.projectId)

firebase.auth().signInAnonymously()
  .then(() => {
    console.log("Connected to firebase, spinning up server.")
    const adapter = new ServerFirebaseAdapter(firebase.database())
    const server = new Server(adapter, Date.now)
    server.newDungeon()
  })

