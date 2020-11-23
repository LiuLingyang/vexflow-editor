const path = require('path');
const utils = require('./utils');
const webpack = require('webpack');
const config = require('../config');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.config');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

Object.keys(baseWebpackConfig.entry).forEach(function (name) {
    baseWebpackConfig.entry[name] = [
        'react-hot-loader/patch',
        'webpack-dev-server/client?http://localhost:3001/',
        'webpack/hot/dev-server'
    ].concat(baseWebpackConfig.entry[name]);
});

module.exports = merge(baseWebpackConfig, {
    mode: 'development',
    output: {
        path: config.dev.assetsRoot,
        publicPath: config.dev.assetsPublicPath,
        filename: utils.assetsPath('js/[name].js'),
        chunkFilename: utils.assetsPath('js/[id].js')
    },
    module: {
        rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
    },
    devServer: {
        port: 3001,
        contentBase: config.dev.assetsPublicPath,
        hot: true,
        inline: true,
        stats: 'errors-only',
        proxy: {
            '!**/*.hot-update*': "http://127.0.0.1:3000"
        }
    },
    devtool: '#cheap-module-eval-source-map',
    watch: true,
    plugins: [
        new webpack.DefinePlugin({
            'process.env': config.dev.env
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new FriendlyErrorsPlugin()
    ]
});
