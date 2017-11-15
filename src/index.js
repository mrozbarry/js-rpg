//import Client from "./lib/Client"
import Dungeon from "./lib/Dungeon"
import Renderer from "./lib/Renderer"

const dungeon = new Dungeon({
  seed: (new Date()).toISOString(),
  width: 80,
  height: 60,
})
dungeon.onStart = onStart
dungeon.onProgress = onProgress
dungeon.onFinish = onFinish

const renderer = new Renderer(1024, 768)
renderer.setCanvas(document.getElementById("canvas"))
renderer.setDungeon(dungeon)
renderer.tileSize = 10

renderer.init()
  .then(() => {
    dungeon
      .generate({
        roomOptions: {
          minRoomSize: 5,
          maxRoomSize: 25,
          maxAttempts: 200
        },
        mazeOptions: {
          chanceOfHorizontalJoin: 80,
          chanceOfVerticalJoin: 50
        },
        doorOptions: {
          chance: 30
        }
      })
  })



const progress = document.querySelector(".progress")
const bar = progress.querySelector(".progress-bar")
function onStart() {
  progress.style.display = "block"
}

function onProgress(thing, percent) {
  bar.style.width = `${percent}%`
  bar.innerText = `${thing} (${percent}%)`
  renderer.draw()
}
function onFinish() {
  progress.style.display = "none"
  renderer.draw()
}
