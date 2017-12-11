import fastRandom from "fast-random"

export function randInt(rnd, a, b = 0) {
  if (typeof a !== "number") throw new Error("randInt takes at least rnd and a number")
  const low = Math.min(a, b)
  const high = Math.max(a, b)
  return low + rnd.nextInt() % (high - low + 1)
}

export function randItem(rnd, array) {
  const index = randInt(rnd, 0, array.length - 1)
  return array[index]
}

export function hash(str) {
  return str.split("").reduce((hash, letter) => {
    return ((hash << 5) + hash) + letter.charCodeAt(0)
  }, 5381)
}

export function init(key) {
  const h = hash(key.toString())
  return fastRandom(h)
}
