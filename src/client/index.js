// import * as firebase from "firebase"
import Client from "./lib/Client"

// firebase.initializeApp({
//   apiKey: "AIzaSyAft80pWp2Lq_IIuzAgIgjBsLIs6TaeqU0",
//   authDomain: "js-rpg-3ee33.firebaseapp.com",
//   databaseURL: "https://js-rpg-3ee33.firebaseio.com",
//   projectId: "js-rpg-3ee33"
// })
//
// firebase
//   .auth()
//   .signInAnonymously()
//   .then((user) => {
//     const client = new Client({
//       user,
//       canvas: document.getElementById("canvas"),
//       database: firebase.database()
//     })
//   })

const client = new Client({
  userId: "local",
  canvas: document.getElementById("canvas"),
  firebaseDatabase: null // firebase.database()
})

client.init()
  .then(() => console.log("Client initialized"))
  .catch(console.error)
