import * as admin from "firebase-admin"
import Server from "./lib/Server"
import adminConfig from "../../config/admin-credentials.json"

const clientConfig = {
  apiKey: "AIzaSyAft80pWp2Lq_IIuzAgIgjBsLIs6TaeqU0",
  authDomain: "js-rpg-3ee33.firebaseapp.com",
  databaseURL: "https://js-rpg-3ee33.firebaseio.com",
  projectId: "js-rpg-3ee33"
}

const fb = admin.initializeApp({
  credential: admin.credential.cert(adminConfig),
  databaseURL: clientConfig.databaseURL
})

console.log("Starting js-rpg server process.")

const getTime = () => Date.now()

console.log("Connected to firebase, spinning up server.")
const server = new Server(fb.database())

server.isServerAvailable().then((available) => console.log("is available?", available))

server
  .init(getTime)
  .then(() => {
    console.log("Server is up and running")
  })
  .catch(console.error)
