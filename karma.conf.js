module.exports = function (config) {
    config.set({

        basePath: '.',

        frameworks: ['mocha'],

        files: [
            'dist/taucharts.css',
            'dist/plugins/tooltip.css',
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

        webpack: getTestWebpackConfig(),
        webpackMiddleware: {
            noInfo: true
        },
        browserNoActivityTimeout: 100000,
        port: 9876,

        colors: true,
        logLevel: config.LOG_INFO,

        singleRun: true
    });
};

function getTestWebpackConfig() {

    const path = require('path');
    const webpack = require('webpack');

    return {
        resolve: {
            modules: [
                path.resolve('.'),
                'bower_components',
                'node_modules'
            ],
            alias: {
                'canvg': 'bower_components/canvg/canvg.js',
                'es6-promise': 'bower_components/es6-promise/es6-promise.js',
                'fetch': 'bower_components/fetch/fetch.js',
                'file-saver': 'test/utils/saveAs.js',
                'print.style.css': 'plugins/print.style.css',
                'rgbcolor': 'bower_components/canvg/rgbcolor.js',
                'stackblur': 'bower_components/canvg/StackBlur.js',
                'taucharts': 'src/tau.charts.ts',
                'tau-tooltip': 'node_modules/tau-tooltip/tooltip.js'
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
                VERSION: require('./package.json').version
            })
        ]
    };
}
