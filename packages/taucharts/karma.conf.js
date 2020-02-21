const path = require('path');

module.exports = function (config) {

    const DEBUG = Boolean(config.tauchartsDebug);

    config.set({

        basePath: '.',

        frameworks: ['mocha'],

        files: [
            `dist/taucharts.css`,
            `dist/plugins/tooltip.css`,
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

        preprocessors: {'test/tests-main.js': ['webpack']},
        reporters: (DEBUG ?
            ['spec'] :
            ['coverage-istanbul', 'spec', 'coveralls']),
        coverageReporter: (DEBUG ? null : {
            type: 'in-memory'
        }),
        coverageIstanbulReporter: {
            reports: ['html', 'lcovonly', 'text-summary'],
            dir: path.join(__dirname, 'coverage'),
            combineBrowserReports: true,
            fixWebpackSourcePaths: true,
            // Omit files with no statements, no functions and no branches from the report
            skipFilesWithNoCoverage: true,
            'report-config': {
                html: {
                    // outputs the report in ./coverage/html
                    subdir: 'html'
                }
            },
        },
        webpack: getTestWebpackConfig(DEBUG),
        webpackMiddleware: {
            noInfo: true
        },
        browserNoActivityTimeout: 100000,
        port: 9876,

        colors: true,
        logLevel: config.LOG_INFO,

        singleRun: (!DEBUG)
    });
};

function getTestWebpackConfig(DEBUG) {

    const path = require('path');
    const webpack = require('webpack');

    return {
        resolve: {
            modules: [
                path.resolve('.'),
                'node_modules'
            ],
            alias: {
                'file-saver': 'test/utils/saveAs.js',
                'print.style.css': 'plugins/print.style.css',
                'taucharts': 'src/tau.charts.ts',
                'tau-tooltip': 'node_modules/tau-tooltip/tooltip.js'
            },
            extensions: ['.js', '.json', '.ts']
        },
        devtool: 'inline-source-map',
        mode: `development`,
        module: {
            rules: [
                {
                    loader: 'css-loader',
                    test: /\.css$/
                },
                {
                    loader: 'babel-loader',
                    test: /\.(js|ts)$/,
                    exclude: [
                        path.resolve(__dirname, './node_modules'),
                    ],
                    options: {
                        babelrc: false,
                        presets: [
                            require.resolve(`@babel/preset-typescript`)
                        ],
                        plugins: DEBUG ? [] : [
                           [
                               require.resolve(`babel-plugin-istanbul`),
                               {
                                   exclude: [
                                       'test',
                                       'addons',
                                       'plugins',
                                       'node_modules',
                                       'src/utils/polyfills.js',
                                       'src/utils/d3-labeler.js',
                                       'src/elements/coords.geomap.js',
                                       'src/api/chart-map.ts',
                                   ],
                               }
                           ]
                        ],
                        cacheDirectory: true,
                    },
                },
            ].filter((x) => x)
        },
        stats: {
            colors: true,
            reasons: true
        },
        plugins: [
            new webpack.DefinePlugin({
                VERSION: JSON.stringify(require('./package.json').version),
            })
        ]
    };
}
