const path = require('path');

module.exports = {
    dev: {
        env: require('./dev.env'),
        assetsRoot: path.resolve(__dirname, '../public'),
        assetsSubDirectory: 'static',
        assetsPublicPath: 'http://localhost:3001/',
        viewpath: path.resolve(__dirname, '../client/views'),
        cssSourceMap: true
    },
    build: {
        env: require('./prod.env'),
        assetsRoot: path.resolve(__dirname, '../public'),
        assetsSubDirectory: 'static',
        assetsPublicPath: '/public',
        viewpath: path.resolve(__dirname, '../public/views'),
        cssSourceMap: false
    }
};
