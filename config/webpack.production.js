const path = require("path")

const ROOT = path.resolve(__dirname, "..")

module.exports = {
  devtool: "cheap-eval-source-map",

  entry: {
    client: path.resolve(ROOT, "src", "client", "index.js"),
  },

  output: {
    filename: "[name].js",
    publicPath: "/",
    path: path.resolve(ROOT, "public"),
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
}
