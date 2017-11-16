import Client from "./lib/Client"
import Dungeon from "./lib/Dungeon"
// import Renderer from "./lib/Renderer"

const dungeon = new Dungeon({
  seed: (new Date()).toISOString(),
  width: 10,
  height: 5,
})
const client = new Client({ canvas: document.getElementById("canvas"), width: 1600, height: 600 })
const progress = document.querySelector(".progress")
const bar = progress.querySelector(".progress-bar")
const text = progress.querySelector(".progress-text")

function onStart() {
  progress.style.display = "block"
}

function onProgress(thing, percent) {
  const chunk = Math.floor(percent / 10) * 10
  bar.style.width = `${chunk}%`
  text.innerText = `${thing} (${percent}%)`
}
function onFinish() {
  progress.style.display = "none"
}

function main() {
  dungeon.onStart = onStart
  dungeon.onProgress = onProgress
  dungeon.onFinish = onFinish

  client.renderer.setDungeon(dungeon)
  client.renderer.tileSize = 16

  client.start()
  dungeon
    .generate({
      roomOptions: false,
      // roomOptions: {
      //   minRoomSize: 5,
      //   maxRoomSize: 25,
      //   maxAttempts: 200
      // },
      mazeOptions: {
        chanceOfHorizontalJoin: 80,
        chanceOfVerticalJoin: 50
      },
      doorOptions: {
        chance: 30
      }
    })

}

main()

