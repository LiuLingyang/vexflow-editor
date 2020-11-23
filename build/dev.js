
const path = require('path');
const chalk = require('chalk');
const webpack = require('webpack');
const config = require('../config');
const webpackConfig = require('./webpack.dev.config');
const devServer = require('webpack-dev-server');

process.env.NODE_ENV = 'development';

let compiler = webpack(webpackConfig);
let server = new devServer(compiler, webpackConfig.devServer);
console.log(chalk.cyan('dev server started at ' + webpackConfig.devServer.port));
server.listen(webpackConfig.devServer.port);
