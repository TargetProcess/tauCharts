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
            'dist/tauCharts.js',
            'test/tests-main.js',
            {included: false, pattern: 'test/**/*.*'},
            {included: false, pattern: 'src/**/*.*'},
            {included: false, pattern: 'plugins/**/*.*'},
            {included: false, pattern: 'less/**/*.*'}
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
        preprocessors: {'test/tests-main.js': ['rollup', 'sourcemap']},
        reporters: ['coverage', 'spec', 'coveralls'],
        coverageReporter: {
            type: 'lcovonly',
            dir: 'coverage/'
        },
        rollupPreprocessor: getTestRollupConfig(),
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