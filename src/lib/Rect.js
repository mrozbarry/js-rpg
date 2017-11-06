import Size from "./Size"

export default class Rect extends Size {
  constructor({ x = 0, y = 0, width = 0, height = 0 }) {
    super({ width, height })
    this.position = { x, y }
  }

  overlaps(rect) {
    const rightPointOut = this.position.x + this.size.x <= rect.position.x + 1
    const leftPointOut = this.position.x >= rect.position.x + rect.size.x - 1
    const bottomPointOut = this.position.y + this.size.y <= rect.position.y + 1
    const topPointOut = this.position.y >= rect.position.y + rect.size.y - 1

    return !(rightPointOut || leftPointOut || bottomPointOut || topPointOut)
  }

  toLines() {
    const left = this.position.x
    const right = left + this.size.x
    const top = this.position.y
    const bottom = top + this.size.y
    return [
      { a: { x: left, y: top }, b: { x: right, y: top }, type: "horizontal" },
      { a: { x: left, y: bottom }, b: { x: right, y: bottom }, type: "horizontal" },
      { a: { x: left, y: top }, b: { x: left, y: bottom }, type: "vertical" },
      { a: { x: right, y: top }, b: { x: right, y: bottom }, type: "vertical" }
    ]
  }

  sharesBoundary(other) {
    const lines = this.toLines()
    const otherLines = other.toLines()

    return lines.some((line) => {
      const otherSimilarLines = otherLines.filter((otherLine) => {
        if (otherLine.type !== line.type) {
          return false
        }

        const axisOverlaps = (p1, p2) => {
          const p1Min = Math.min(p1[0], p1[1]) + 1
          const p1Max = Math.max(p1[0], p1[1]) - 1
          const p2Min = Math.min(p2[0], p2[1]) + 1
          const p2Max = Math.max(p2[0], p2[1]) - 1
          return (p1Min >= p2Min && p1Min <= p2Max) && (p1Max >= p2Min && p1Max <= p2Max)
        }

        if (line.type === "horizontal" && line.a.y === otherLine.a.y) {
          return axisOverlaps(
            [line.a.x, line.b.x],
            [otherLine.a.x, otherLine.b.x]
          )
        } else if (line.type === "veritcal" && line.a.x === otherLine.a.x) {
          return axisOverlaps(
            [line.a.y, line.b.y],
            [otherLine.a.y, otherLine.b.y]
          )
        }

        return false
      })

      return otherSimilarLines.some((otherLine) => {
      })
    })
  }
}
