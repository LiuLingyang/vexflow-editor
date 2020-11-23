const chalkAnimation = require('chalk-animation');
const path = require('path');
const chalk = require('chalk');
const shell = require('shelljs');
const webpack = require('webpack');
const config = require('../config');
const webpackConfig = require('./webpack.prod.config');

process.env.NODE_ENV = 'production';

const animation = chalkAnimation.rainbow('building for production...');
animation.start();

const assetsPath = path.join(config.build.assetsRoot);
shell.rm('-rf', assetsPath);

webpack(webpackConfig, function (err, stats) {
    animation.stop();
    if (err) throw err;
    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }) + '\n\n');

    console.log(chalk.cyan('Build complete.\n'));
});
