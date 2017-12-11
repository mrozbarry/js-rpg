const path = require("path")

const ROOT = path.resolve(__dirname, "..")

module.exports = {
  devtool: "cheap-eval-source-map",

  entry: {
    client: path.resolve(ROOT, "src", "client", "index.js"),
    server: path.resolve(ROOT, "src", "server", "index.web.js"),
  },

  output: {
    filename: "[name].js",
    publicPath: "/",
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: /src/,
        loader: "babel-loader",
      },
    ],
  },

  target: "web",

  devServer: {
    port: 8080,
    host: "0.0.0.0",
    contentBase: path.resolve(ROOT, "public"),
  },
}
