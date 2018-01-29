module.exports = function (config) {

    const DEBUG = Boolean(config.tauchartsDebug);

    config.set({

        basePath: '.',

        frameworks: ['mocha'],

        files: [
            `${DEBUG ? 'debug' : 'dist'}/taucharts.css`,
            `${DEBUG ? 'debug' : 'dist'}/plugins/tooltip.css`,
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
        reporters: (DEBUG ?
            ['spec'] :
            ['coverage', 'spec', 'remap-coverage', 'coveralls']),
        coverageReporter: (DEBUG ? null : {
            type: 'in-memory'
        }),
        remapCoverageReporter: (
            DEBUG
                ? null
                : process.env.TRAVIS
                    ? {lcovonly: './coverage/lcov.info'}
                    : {html: './coverage/'}
        ),

        webpack: getTestWebpackConfig(DEBUG),
        webpackMiddleware: {
            noInfo: true
        },
        browserNoActivityTimeout: 100000,
        port: 9876,

        colors: true,
        logLevel: config.LOG_INFO,

        singleRun: (DEBUG ? false : true)
    });
};

function getTestWebpackConfig(DEBUG) {

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
                'file-saver': 'test/utils/saveAs.js',
                'print.style.css': 'plugins/print.style.css',
                'rgbcolor': 'bower_components/rgb-color/dist/rgb-color.js',
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
                        transpileOnly: true
                    }
                },
                (DEBUG ? null : {
                    loader: 'istanbul-instrumenter-loader',
                    test: /\.(js|ts)$/,
                    enforce: 'post',
                    exclude: /test|addons|plugins|node_modules|bower_components|polyfills\.js|d3-labeler\.js|coords\.geomap\.js|chart-map\.ts/,
                    options: {
                        esModules: true
                    }
                })
            ].filter((x) => x)
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
};
