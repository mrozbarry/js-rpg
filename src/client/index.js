import Dungeon from "../shared/Dungeon"
import * as THREE from "three"

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const VIEW_ANGLE = 65
const ASPECT = WIDTH / HEIGHT
const NEAR = 0.1
const FAR = 10000

const renderer = new THREE.WebGLRenderer()
const camera = new THREE.PerspectiveCamera(
  VIEW_ANGLE, ASPECT, NEAR, FAR
)
const scene = new THREE.Scene()

scene.add(camera)
renderer.setSize(WIDTH, HEIGHT)
document.body.appendChild(renderer.domElement)

const ROOM_SIZE = 5

// const pointLight = new THREE.PointLight("#FFF")
// pointLight.position.x = 0
// pointLight.position.y = 0
// pointLight.position.z = -190
// scene.add(pointLight)

// const actor = new THREE.Mesh(
//   new THREE.BoxGeometry(.5, .5, 1),
//   new THREE.MeshBasicMaterial({ color: 0xFF0000 })
// )
// actor.position.z = -200
// scene.add(actor)

let lastNow = performance.now()

renderTile(scene, 0, 0, -200, "NEW".split(""))

// const dungeon = new Dungeon({ width: 10, height: 10, seed: (new Date()).toISOString() })
// dungeon
//   .generate()
//   .then(() => {
//     dungeon.data.forEach((cell, index) => {
//       const x = index % dungeon.width
//       const y = Math.floor(index / dungeon.width)
//
//       renderTile(scene, x, y, -200, "NEW".split(""))
//     })
//   })
//   .then(() => {
//     lastNow = performance.now()
//     render(lastNow)
//   })

function renderTile(scene, x, y, z, walls) {
  scene.add(renderFloor(x, y, z))
  // walls.forEach((direction) => {
  //   scene.add(renderWall(x, y, z, direction))
  // })
}

function renderFloor(x, y, z) {
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(ROOM_SIZE, ROOM_SIZE, 1.0),
    new THREE.MeshBasicMaterial({ color: 0x888888 })
  )
  floor.position.x = x - (ROOM_SIZE / 2)
  floor.position.y = y + (ROOM_SIZE / 2)
  floor.position.z = z
  return floor
}

function renderWall(x, y, z, direction) {
  const WIDTH = 0.2
  const HEIGHT = 2.0
  if (direction === "N") {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(ROOM_SIZE, WIDTH, HEIGHT),
      new THREE.MeshBasicMaterial({ color: 0x1aa11a })
    )
    wall.position.x = x - (ROOM_SIZE / 2)
    wall.position.y = y + (ROOM_SIZE / 2)
    wall.position.z = z + 1
    return wall

  } else if (direction === "S") {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(ROOM_SIZE, WIDTH, HEIGHT),
      new THREE.MeshBasicMaterial({ color: 0x1aa11a })
    )
    wall.position.x = x - (ROOM_SIZE / 2)
    wall.position.y = y - (ROOM_SIZE / 2)
    wall.position.z = z + 1
    return wall

  } else if (direction === "E") {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(WIDTH, ROOM_SIZE, HEIGHT),
      new THREE.MeshBasicMaterial({ color: 0x1aa11a })
    )
    wall.position.x = x - (ROOM_SIZE / 2)
    wall.position.y = y + (ROOM_SIZE / 2)
    wall.position.z = z + 1
    return wall

  } else if (direction === "W") {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(WIDTH, ROOM_SIZE, HEIGHT),
      new THREE.MeshBasicMaterial({ color: 0xFF00FF })
    )
    wall.position.x = x - (ROOM_SIZE / 2)
    wall.position.y = y - (ROOM_SIZE / 2)
    wall.position.z = z + 1
    return wall

  }
}

// let dx = ROOM_SIZE * 0.5
// let dy = ROOM_SIZE * 0.2

function render(now) {
  const delta = now ? now - lastNow : 0.1

  // pointLight.position.x += (dx * delta / 1000.0)
  // pointLight.position.y += (dy * delta / 1000.0)
  // if (pointLight.position.x < 0) {
  //   dx = -dx
  //   pointLight.position.x = 0.01
  // }
  // if (pointLight.position.x > dungeon.width * ROOM_SIZE) {
  //   dx = -dx
  //   pointLight.position.x = (dungeon.width * ROOM_SIZE) - 0.01
  // }
  // if (pointLight.position.y < 0) {
  //   dy = -dy
  //   pointLight.position.y = 0.01
  // }
  // if (pointLight.position.y > dungeon.height * ROOM_SIZE) {
  //   dy = -dy
  //   pointLight.position.y = (dungeon.height * ROOM_SIZE) - 0.01
  // }
  //
  // actor.position.x = pointLight.position.x
  // actor.position.y = pointLight.position.y

  camera.position.x = 0
  camera.position.y = 0
  camera.position.z = -100
  camera.lookAt(0, 0, -200)


  renderer.render(scene, camera)

  lastNow = now
  requestAnimationFrame(render)
}
