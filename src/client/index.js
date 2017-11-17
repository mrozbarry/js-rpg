import Client from "./lib/Client"
import Server from "../shared/Server"
import Connection from "./lib/LocalConnection"

const server = new Server()
server.newDungeon()

const connection = new Connection(server)


const client = new Client({
  connection: connection,
  canvas: document.getElementById("canvas")
})


// // import Renderer from "./lib/Renderer"
//
// const dungeon = new Dungeon({
//   seed: (new Date()).toISOString(),
//   width: 90,
//   height: 40,
// })
// const client = new Client({
//   canvas: document.getElementById("canvas"),
//   width: 1600,
//   height: 700
// })
//
// function main() {
//   client.renderer.setDungeon(dungeon)
//   client.renderer.tileSize = 64
//
//   client.start()
//   dungeon
//     .generate({
//       // roomOptions: false,
//       roomOptions: {
//         minRoomSize: 5,
//         maxRoomSize: 25,
//         maxAttempts: 200
//       },
//       mazeOptions: {
//         chanceOfHorizontalJoin: 80,
//         chanceOfVerticalJoin: 50
//       },
//       doorOptions: {
//         chance: 30
//       }
//     })
//
// }
//
// main()
//
