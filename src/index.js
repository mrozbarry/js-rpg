import Floor from "./lib/Floor"

const f = new Floor({ size: { width: 100, height: 100 } })
f.generate()
console.log(f)
