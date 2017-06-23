module.exports = function (config) {
    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: '..',

        // frameworks to use
        frameworks: ['mocha'],

        // list of files / patterns to load in the browser
        files: [
            'dist/tauCharts.css',
            'dist/plugins/tauCharts.tooltip.css',
            'node_modules/d3/build/d3.js',
            'node_modules/topojson/build/topojson.js',
            'test/utils/test.css',
            'test/utils/polyfills.js',
            'test/tests-main.js'
        ],
        browsers: process.env.TRAVIS ? ['ChromeTravisCI'] : ['Chrome'],
        customLaunchers: {
            ChromeTravisCI: {
                base: 'Chrome',
                flags: [
                    '--no-sandbox'
                ]
            }
        },

        preprocessors: {'test/tests-main.js': ['webpack', 'sourcemap']},
        reporters: ['coverage', 'spec', 'coveralls', 'remap-coverage'],
        coverageReporter: {
            type: 'in-memory'
        },
        remapCoverageReporter: {
            html: './coverage/'
        },
        webpackMiddleware: {
            noInfo: true
        },
        webpack: getTestWebpackConfig(),
        browserNoActivityTimeout: 100000,
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        logLevel: config.LOG_INFO,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true
    });
};

function getTestWebpackConfig() {
    var path = require('path');
    var ensureDir = function (absolutePath) {
        var fs = require('fs-extra');
        fs.mkdirsSync(absolutePath);
        return absolutePath;
    };
    var cachePath = path.join(require('os').tmpdir(), './webpackCache');
    var webpack = require('webpack');
    return {
        resolve: {
            modules: [
                path.resolve('.'),
                'bower_components',
                'node_modules'
            ],
            alias: {
                'tau-tooltip': 'node_modules/tau-tooltip/tooltip.js',
                taucharts: 'src/tau.charts.ts',
                'print.style.css': 'plugins/print.style.css',
                rgbcolor: 'bower_components/canvg/rgbcolor.js',
                stackblur: 'bower_components/canvg/StackBlur.js',
                canvg: 'bower_components/canvg/canvg.js',
                'file-saver': 'test/utils/saveAs.js',
                fetch: 'bower_components/fetch/fetch.js',
                'es6-promise': 'bower_components/es6-promise/es6-promise.js'
            },
            extensions: ['.js', '.json', '.ts']
        },
        devtool: 'inline-source-map',
        module: {
            rules: [
                {
                    loader: 'css-loader',
                    test: /\.css$/
                },
                {
                    loader: 'imports?this=>window!exports?window.Modernizr',
                    test: /modernizer[\\\/]modernizr\.js$/
                },
                {
                    loader: 'ts-loader',
                    test: /\.(js|ts)$/,
                    exclude: [
                        'node_modules',
                        'bower_components'
                    ],
                    options: {
                        compilerOptions: {
                            sourceMap: true
                        },
                        entryFileIsJs: true,
                        transpileOnly: true
                    }
                },
                {
                    loader: 'istanbul-instrumenter-loader',
                    test: /\.(js|ts)$/,
                    enforce: 'post',
                    exclude: /test|addons|plugins|node_modules|bower_components|polyfills\.js|d3-labeler\.js|coords\.geomap\.js|chart-map\.ts/,
                    options: {
                        esModules: true
                    }
                }
            ]
        },
        externals: {
            d3: 'd3'
        },
        stats: {
            colors: true,
            reasons: true
        },
        plugins: [
            new webpack.DefinePlugin({
                VERSION: require('../package.json').version
            })
        ]
    };
}
