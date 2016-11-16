module.exports = function (config) {
    var webpackConfig = require('./webpack.config');
    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: '..',

        // frameworks to use
        frameworks: ['mocha'],

        // list of files / patterns to load in the browser
        files: [
            'css/tooltip.default.css',
            'css/tauCharts.default.css',
            'test/utils/test.css',
            'test/utils/polyfills.js',
            'node_modules/d3/d3.js',
            'css/base.css',
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
        reporters: ['coverage', 'spec', 'coveralls'],
        coverageReporter: {
            type: 'lcovonly',
            dir: 'coverage/'
        },
        webpackMiddleware: {
            noInfo: true
        },
        webpack: webpackConfig.testWithCoverage,
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