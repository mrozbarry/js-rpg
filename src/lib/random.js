export default function random(low, high) {
  return Math.random() * (high - low) + low
}

export function randomElement(array) {
  const index = Math.floor(random(0, array.length - 1))
  return array[index]
}
