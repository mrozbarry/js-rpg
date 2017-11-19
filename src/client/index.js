import * as firebase from "firebase"
import Client from "./lib/Client"

// For local
// import Server from "../shared/Server"
// import ServerLocalAdapter from "../shared/ServerLocalAdapter"
// import LocalConnection from "./lib/LocalConnection"
//import ServerFirebaseAdapter from "../shared/ServerFirebaseAdapter"

import FirebaseConnection from "./lib/FirebaseConnection"

firebase.initializeApp({
  apiKey: "AIzaSyAft80pWp2Lq_IIuzAgIgjBsLIs6TaeqU0",
  authDomain: "js-rpg-3ee33.firebaseapp.com",
  databaseURL: "https://js-rpg-3ee33.firebaseio.com",
  projectId: "js-rpg-3ee33"
})

firebase
  .auth()
  .signInAnonymously()
  .then((user) => {
    const connection = new FirebaseConnection(firebase)

    // For local
    // const adapter = new ServerLocalAdapter()
    // const connection = new LocalConnection(adapter)
    // const server = new Server(adapter)

    const client = new Client({
      connection: connection,
      canvas: document.getElementById("canvas")
    })

    // For local
    // server.newDungeon()
  })

