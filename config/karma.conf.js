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
        // preprocessors: {'test/tests-main.js': ['rollup', 'sourcemap']},
        preprocessors: {'test/tests-main.js': ['webpack', 'sourcemap']},
        reporters: ['coverage', 'spec', 'coveralls'],
        coverageReporter: {
            type: 'lcovonly',
            dir: 'coverage/'
        },
        // rollupPreprocessor: getTestRollupConfig(),
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

// NOTE: Rollup integration into Karma fails:
// 1. karma-rollup-preprocessor (and karma-rollup-plugin) doesn't rebuild when source file changes.
// 2. When importing TypeScript file via alias (rollup-plugin-alias) multiple times,
//    it fails with "Unexpected token ..." like this is JS but not TS file.
// 3. Didn't try to create coverage reports.
function getTestRollupConfig() {
    return {
        entry: './test/tests-main.js',
        moduleName: 'taucharts-tests',
        format: 'iife',
        useStrict: true,
        external: [
            'd3',
            'topojson',
            'taucharts'
        ],
        globals: {
            'd3': 'd3',
            'topojson': 'topojson',
            'taucharts': 'tauCharts'
        },
        plugins: [
            require('rollup-plugin-alias')({
                'tau-tooltip': 'node_modules/tau-tooltip/src/tooltip.js',
                'taucharts': 'src/tau.charts.ts'
            }),
            require('rollup-plugin-replace')({
                '{{VERSION}}': `${require('../package.json').version}`
            }),
            require('rollup-plugin-node-resolve')(),
            require('rollup-plugin-commonjs')({
                namedExports: {
                    'node_modules/chai/index.js': ['expect', 'assert']
                }
            }),
            require('rollup-plugin-typescript')({
                typescript: require('typescript'),
                target: 'es5',
                allowJs: true,
                lib: [
                    'es6',
                    'dom'
                ],
                include: [
                    '**/*.ts',
                    '**/*.js'
                ],
                exclude: [
                    'node_modules/**',
                    'bower_components/**'
                ]
            })
        ],
        sourceMap: 'inline'
    };
}

function getTestWebpackConfig() {
    var path = require('path');
    var ensureDir = function(absolutePath) {
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
                            inlineSourceMap: true,
                            sourceMap: false
                        },
                        entryFileIsJs: true,
                        transpileOnly: true,
                        cacheDirectory: ensureDir(path.join(cachePath, './babelJS'))
                    }
                },
                // {
                //     loader: 'istanbul-instrumenter-loader',
                //     test: /\.(js|ts)$/,
                //     exclude: [
                //         'node_modules',
                //         'bower_components',
                //         'test',
                //         'plugins',
                //         'src/addons',
                //         'src/utils/polyfills.js'
                //     ],
                //     options: {
                //         esModules: true
                //     }
                // }
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
