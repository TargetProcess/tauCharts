var webpack = require('webpack');
var path = require('path');
var cachePath = path.join(require('os').tmpdir(), './webpackCache');

var ensureDir = function (absolutePath) {
    var fs = require('fs-extra');
    fs.mkdirsSync(absolutePath);
    return absolutePath;
};
var coverage = [{
    test: /\.js$/,
    exclude: /test|addons|plugins|node_modules|bower_components|libs\//,
    loader: 'istanbul-instrumenter'
}];
var generateConf = function (postLoader) {
    return {
        resolve: {
            root: [
                path.resolve('.')
            ],
            modulesDirectories: [
                'bower_components',
                'node_modules'
            ],
            alias: {
                schemes: 'test/utils/schemes.js',
                'tau-tooltip': 'node_modules/tau-tooltip/tooltip.js',
                testUtils: 'test/utils/utils.js',
                brewer: 'src/addons/color-brewer.js',
                tauCharts: 'src/tau.charts.js',
                'print.style.css': 'plugins/print.style.css',
                rgbcolor: 'bower_components/canvg/rgbcolor.js',
                stackblur: 'bower_components/canvg/StackBlur.js',
                canvgModule: 'bower_components/canvg/canvg.js',
                FileSaver: 'test/utils/saveAs.js',
                fetch: 'bower_components/fetch/fetch.js',
                promise: 'bower_components/es6-promise/promise.js'
            },
            extensions: ['', '.js', '.json']
        },
        devtool: 'inline-source-map',
        module: {
            loaders: [
                {test: /\.css$/, loader: 'css-loader'},
                {
                    test: /modernizer[\\\/]modernizr\.js$/,
                    loader: 'imports?this=>window!exports?window.Modernizr'
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules|libs|bower_components/,
                    loader: 'babel-loader',
                    query: {
                        cacheDirectory: ensureDir(path.join(cachePath, './babelJS'))
                    }
                }
            ],
            postLoaders: postLoader
        },
        externals: {
            underscore: '_',
            d3:'d3'
        },
        query: {
            cacheDirectory: ensureDir(path.join(cachePath, './babelJS'))
        },
        plugins: [
            new webpack.ProvidePlugin({
                d3: 'd3',
                _: 'underscore'
            })
        ],
        debug: false,
        stats: {
            colors: true,
            reasons: true
        },
        progress: true
    };
};

module.exports = {
    coverage: generateConf(coverage),
    default: generateConf([])
};