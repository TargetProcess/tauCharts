var webpack = require('webpack');
var path = require('path');
var cachePath = path.join(require('os').tmpdir(), './webpackCache');
var transformUMDExternal = require('webpack-umd-external');
var ensureDir = function (absolutePath) {
    var fs = require('fs-extra');
    fs.mkdirsSync(absolutePath);
    return absolutePath;
};
var coverage =  {
    test: /\.js$/,
    exclude: /test|addons|plugins|node_modules|bower_components|libs\//,
    loader: 'isparta-loader'
};

var toAbsolute = function (relativePath) {
    return path.join(__dirname, relativePath);
};

var babelConfig = {
    test: /\.js$/,
    exclude: /node_modules|libs|bower_components/,
    loader: 'babel-loader',
    query: {
        presets: ['es2015'],
        cacheDirectory: ensureDir(path.join(cachePath, './babelJS'))
    }
};
var generateTestConf = function (addLoaders) {
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
        isparta: {
            embedSource: true,
            noAutoWrap: true,
            // these babel options will be passed only to isparta and not to babel-loader
            babel: {
                presets: ['es2015']
            }
        },
        module: {
            loaders: [
                {test: /\.css$/, loader: 'css-loader'},
                {
                    test: /modernizer[\\\/]modernizr\.js$/,
                    loader: 'imports?this=>window!exports?window.Modernizr'
                },
                babelConfig
            ].concat(addLoaders)
        },
        externals: {
            d3: 'd3'
        },
        query: {
            cacheDirectory: ensureDir(path.join(cachePath, './babelJS'))
        },
        debug: false,
        stats: {
            colors: true,
            reasons: true
        },
        progress: true,
        plugins: [
            new webpack.DefinePlugin({
                VERSION: JSON.stringify(require('../package.json').version)
            })
        ]
    };
};

var exportBuild = {
    entry: './plugins/export.js',
    output: {
        library: 'exportTo',
        libraryTarget: 'umd',
        path: 'build/development/plugins/',
        filename: 'tauCharts.export.js'
    },
    resolve: {
        alias: {
            tauCharts: toAbsolute('../src/tau.charts.js'),
            'print.style.css': toAbsolute('../plugins/print.style.css'),
            rgbcolor: toAbsolute('../bower_components/canvg/rgbcolor.js'),
            stackblur: toAbsolute('../bower_components/canvg/StackBlur.js'),
            canvg: toAbsolute('../bower_components/canvg/canvg.js'),
            FileSaver: toAbsolute('../bower_components/FileSaver.js/FileSaver.js'),
            fetch: toAbsolute('../bower_components/fetch/fetch.js'),
            promise: toAbsolute('../bower_components/es6-promise/promise.js')
        }
    },
    externals: {
        tauCharts: 'tauCharts'
    },
    module: {
        loaders: [
            babelConfig,
            {
                test: /\.css$/,
                loader: 'raw-loader'
            }
        ]
    },
    stats: {
        timings: true
    },
    plugins: [
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(require('../package.json').version)
        })
    ]
};
var webpackConf = {
    entry: './src/tau.charts.js',
    output: {
        library: 'tauCharts',
        libraryTarget: 'umd',
        path: 'build/development',
        filename: 'tauCharts.js'
    },
    externals:  transformUMDExternal({
        d3: 'd3'
    }),
    module: {
        loaders: [babelConfig]
    },
    stats: {
        timings: true
    },
    plugins: [
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(require('../package.json').version)
        })
    ]
};

module.exports = {
    testWithCoverage: generateTestConf(coverage),
    testWithoutCoverage: generateTestConf([]),
    exportBuild: exportBuild,
    chartBuild: webpackConf
};