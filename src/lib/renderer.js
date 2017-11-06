export default function render(map, items, characters, conversation, me) {
}

export function renderAt(context, map, items, characters, x, y) {
  const tile = map.tile[x + (y * map.width)]
  const items = items.filter((item) => item.x === x && item.y === y)
  const characters = characters.filter((character) => character.x === x && character.y === y)

  return [tile].concat(items).concat(characters).filter((thing) => !!thing)
}
