export default init(worldId, chunkId) {
  return { worldId, chunkId, space: null }
}

export async function loadWorldChunk({ worldId, chunkId }) {
  const space = await loadSpace(worldId, chunkId)
  return { worldId, chunkId, space }
}
