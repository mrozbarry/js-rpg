export const initialVisibility = () => ({
  currentlyVisibleIndexes: [],
  previouslyVisibleIndexes: [],
  modifiers: {
    range: 4,
    showAll: false,
    showAllPreviouslyVisible: false,
  }
})


export default (dungeon, position, visibility) => {
  const previouslyVisible = visibility
    .currentlyVisibleIndexes
    .concat(visibility.previouslyVisibleIndexes)
    .reduce((indexes, currentIndex) => indexes.concat(indexes.indexOf(currentIndex) >= 0 ? [] : currentIndex), [])

  const tileCenter = {
    x: Math.floor(position.x) + 0.5,
    y: Math.floor(position.y) + 0.5,
  }

  const currentCandidates = indexesWithinRange(dungeon, tileCenter, visibility.modifiers.range)

  return {
    currentlyVisibleIndexes: currentCandidates.filter((index) => canSeeFrom(dungeon, position, index)),
    previouslyVisibleIndexes: previouslyVisible,
    modifiers: visibility.modifiers
  }
}


export const indexesWithinRange = (dungeon, position, range) => {
  return dungeon.data.reduce((indexesInRange, _, idx) => {
    const y = Math.floor(idx / dungeon.width)
    const x = idx % dungeon.width

    const dist = Math.sqrt(
      ((position.x - x) * (position.x - x)) +
      ((position.y - y) * (position.y - y))
    )

    if (dist <= range) return indexesInRange.concat(idx)

    return indexesInRange
  }, [])
}


export const canSeeFrom = (dungeon, position, targetIndex) => {
  const y = Math.floor(targetIndex / dungeon.width)
  const x = targetIndex % dungeon.width

  const slope = (y - position.y) / (x - position.x)

  const dist = Math.sqrt(
    ((position.x - x) * (position.x - x)) +
    ((position.y - y) * (position.y - y))
  )

  const lineOfVisibility = [
    { ...position },
    { x, y }
  ]

  let lastPosition = null
  for(let increm = 0; increm < dist; increm += 0.1) {
    const p = {
      x: Math.floor(x + (slope * increm)),
      y: Math.floor(y + (slope * increm))
    }
    if (p.x === Math.floor(position.x) && p.y === Math.floor(position.y)) continue
    if (lastPosition && lastPosition.x === p.x && lastPosition.y === p.y) continue

    const cell = dungeon.get(p.x, p.y)
    if (!cell) continue
    if (cell.walls === "") continue

    const wallLines = cell.walls.split("").reduce((lines, wall) => {
      let startPosition = null
      let endPosition = null

      switch(wall) {
      case "N":
        startPosition = p
        endPosition = { ...p, x: p.x + 1 }
        break

      case "E":
        startPosition = { ...p, x: p.x + 1 }
        endPosition = { ...p, y: p.y + 1 }
        break

      case "S":
        startPosition = { ...p, y: p.y + 1 }
        endPosition = { ...p, x: p.x + 1 }
        break

      case "W":
        startPosition = p
        endPosition = { ...p, y: p.y + 1 }
        break
      }

      return lines.concat([[startPosition, endPosition]])
    }, [])

    if (wallLines.some((line) => linesIntersect(lineOfVisibility, line))) return false

    lastPosition = p
  }

  return true
}


export const linesIntersect = ([p1a, p1b], [p2a, p2b]) => {
  const a1 = p2b.y - p1a.y
  const b1 = p1a.x - p1b.x
  const c1 = (p1b.x * p1a.y) - (p1a.x * p2a.y)

  const r3 = (a1 * p2a.x) + (b1 * p2a.y) + c1
  const r4 = (a1 * p2b.x) + (b1 * p2b.y) + c1

  if (r3 !== 0 && r4 !== 0 && Math.sign(r3) === Math.sign(r4)) return false

  const a2 = p2b.y - p2a.y
  const b2 = p2a.x - p2b.x
  const c2 = (p2b.x * p2a.y) - (p2a.x * p2b.y)

  const r1 = (a2 * p1a.x) + (b2 * p1a.y) + c2
  const r2 = (a2 * p1b.x) + (b2 * p1b.y) + c2

  if (r1 !== 0 && r2 !== 0 && Math.sign(r1) === Math.sign(r2)) return false

  return true
  //
  // const denom = (a1 * b2) - (a2 * b1)
  // if (denom === 0) return true // co-linear
}
