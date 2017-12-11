import uuidv4 from "uuid/v4"

export const initialGameState = (timerFn) => ({
  initialDungeonId: "",
  dungeons: [],
  actors: [],
  timerFn: timerFn,
  lastTick: timerFn(),
  timestepAccumulator: 0,
  timestepValue: 60,
  actorTypeSpeeds: {
    human: 2
  }
})


export default function gameTick(prevState) {
  const now = prevState.timerFn()
  const delta = now - prevState.lastTick
  let state = {
    ...prevState,
    timestepAccumulator: prevState.timestepAccumulator + delta,
    lastTick: now,
  }

  while (state.timestepAccumulator - state.timestepValue > 0) {
    state.timestepAccumulator -= state.timestepValue

    state.actors = state.actors.map((actor) => {
      let actorDungeonId = actor.position.dungeonId
      if (!actor.position.dungeonId) {
        actorDungeonId = state.initialDungeonId
      }
      const dungeon = state.dungeons.find((d) => d.id === actorDungeonId)
      return integrateActorInDungeon(
        state.timestepValue,
        dungeon.dungeon,
        state.actorTypeSpeeds[actor.type] || 1,
        actor
      )
    })
  }

  return state
}


function integrateActorInDungeon(delta, dungeon, speed, actor) {
  if (delta === 0 || !dungeon) return actor

  if (!actor.position) {
    return {
      ...actor,
      position: {
        x: 0,
        y: 0,
        dungeonId: ""
      },
    }
  }

  const noInputsPressed = [
    "up", "down", "left", "right", "action"
  ].every((k) => actor.input[k] === false)
  if (noInputsPressed) return actor

  const dx =
    (actor.input.left ? -1 : 0) +
    (actor.input.right ? 1 : 0)

  const dy =
    (actor.input.up ? -1 : 0) +
    (actor.input.down ? 1 : 0)

  const affectedDirections =
    []
    .concat(dx === -1 ? "W" : [])
    .concat(dx === 1 ? "E" : [])
    .concat(dy === -1 ? "N" : [])
    .concat(dy === 1 ? "S" : [])

  let targetPosition = {
    x: actor.position.x + (speed * dx * delta / 1000),
    y: actor.position.y + (speed * dy * delta / 1000)
  }

  const cell = dungeon.get(Math.floor(actor.position.x), Math.floor(actor.position.y))
  const nextCell = dungeon.get(Math.floor(targetPosition.x), Math.floor(targetPosition.y))
  if (cell !== nextCell) {
    targetPosition = affectedDirections.reduce((pos, direction) => {
      if (cell.hasWalls(direction)) {
        switch(direction) {
        case "N":
        case "S":
          return { ...pos, y: actor.position.y }

        case "E":
        case "W":
          return { ...pos, x: actor.position.x }
        }
      }

      return pos
    }, targetPosition)
  }

  return { ...actor, position: targetPosition }
}
