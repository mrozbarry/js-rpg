import fastRandom from "fast-random"

export function randInt(rnd, a, b = 0) {
  const low = Math.min(a, b)
  const high = Math.max(a, b)
  return low + rnd.nextInt() % (high - low + 1)
}

export function randItem(rnd, array) {
  if (array.length <= 1) return array[0]

  const index = randInt(rnd, 0, array.length - 1)
  return array[index]
}

export function randShuffle(rnd, array) {
  let arr = array.slice(0)
  let i = arr.length - 1
  while(i > 0) {
    const j = randInt(rnd, i)
    const tmp  = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
    i -= 1
  }
  return arr
}

export function randColour(rnd) {
  const validHex = "0123456789ABCDEF".split("")
  return ["r", "g", "b"].reduce((hex) => {
    return hex + randItem(rnd, validHex) + randItem(rnd, validHex)
  }, "#")
}

function hash(str) {
  return str.split("").reduce((hash, letter) => {
    return ((hash << 5) + hash) + letter.charCodeAt(0)
  }, 5381)
}

export function init(key) {
  const h = hash(key.toString())
  return fastRandom(h)
}
