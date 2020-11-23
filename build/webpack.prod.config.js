const path = require("path");
const utils = require("./utils");
const webpack = require("webpack");
const config = require("../config");
const merge = require("webpack-merge");
const baseWebpackConfig = require("./webpack.base.config");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(baseWebpackConfig, {
  mode: "production",
  output: {
    path: config.build.assetsRoot,
    publicPath: config.build.assetsPublicPath,
    filename: utils.assetsPath("js/[name].[chunkhash].js"),
    chunkFilename: utils.assetsPath("js/[id].[chunkhash].js"),
  },
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.cssSourceMap,
      extract: true,
    }),
  },
  devtool: false,
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        commons: {
          name: "commons",
          chunks: "initial",
          minChunks: 2,
        },
      },
    },
    runtimeChunk: {
      name: "manifest",
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": config.build.env,
    }),
    new MiniCssExtractPlugin({
      filename: utils.assetsPath("css/[name].[contenthash].css"),
      allChunks: true,
    }),
    new HtmlWebpackPlugin({
      filename: "views/index.ejs",
      template: "!!raw-loader!client/views/index.ejs",
      inject: true,
      // chunksSortMode: "dependency",
      // chunks: ["manifest", "index"],
    }),
    // new HtmlWebpackPlugin({
    //     filename: 'views/test.ejs',
    //     template: '!!raw-loader!client/views/test.ejs',
    //     inject: true,
    //     chunksSortMode: 'dependency',
    //     chunks:['manifest','test']
    // })
  ],
});
