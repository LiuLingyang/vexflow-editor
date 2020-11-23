const path = require("path");
const utils = require("./utils");
const config = require("../config");
const CopyWebpackPlugin = require("copy-webpack-plugin");

function resolve(dir) {
  return path.join(__dirname, "..", dir);
}

module.exports = {
  entry: {
    index: "./client/entry/index.js",
    // test: "./client/entry/test.js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"],
    modules: [resolve("client"), resolve("node_modules")],
    alias: {
      "@client": resolve("client"),
      "@assets": resolve("client/assets"),
      "@entry": resolve("client/entry"),
      "@util": resolve("client/util"),
      "@service": resolve("client/service"),
      "@components": resolve("client/components"),
      "@routes": resolve("client/routes"),
      "@modules": resolve("client/modules"),
      "@views": resolve("client/views"),
      "@store": resolve("client/store"),
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        include: [resolve("client"), resolve("test")],
        options: {
          cacheDirectory: true,
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: "url-loader",
        query: {
          limit: 10000,
          name: path.posix.join("/static", "img/[name].[hash:7].[ext]"),
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: "url-loader",
        query: {
          limit: 10000,
          name: utils.assetsPath("fonts/[name].[hash:7].[ext]"),
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: resolve("static"),
        to: config.dev.assetsSubDirectory,
      },
    ]),
  ],
};
