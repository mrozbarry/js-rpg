export default function random(low, high) {
  return Math.floor(Math.random() * (high - low) + low)
}

export function randomElement(array) {
  const index = random(0, array.length - 1)
  return array[index]
}
