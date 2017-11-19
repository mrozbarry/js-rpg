import { Server } from "http"
import express from "express"
import morgan from "morgan"


function initServer(port) {
  const app = express()

  const httpServer = Server(app)
  socketIO(httpServer, { path: "g" })
  socketIO.on("connection", (socket) => {
    console.log("New connection")
  })

  app.use(morgan("tiny"))
  app.get("*", (req, res) => {
    return res
      .status(200)
      .sendFile(path.resolve(__dirname, "..", "..", "public", "index.html")
  })

  httpServer.listen(port, () => {
    console.log(`Started server on //0.0.0.0:${port}`)
  })
}
