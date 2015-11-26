module.exports = function (config) {
    var webpackConfig = require('./webpack.test.config');
    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: '..',

        // frameworks to use
        frameworks: ['mocha'],

        // list of files / patterns to load in the browser
        files: [
            {pattern: 'css/tooltip.default.css', included: true},
            {pattern: 'css/tauCharts.default.css', included: true},
            {pattern: 'test/utils/test.css', included: true},
            {pattern: 'node_modules/underscore/underscore.js', included: true},
            {pattern: 'node_modules/d3/d3.js', included: true},
            {pattern: 'css/base.css', included: true},
            'test/tests-main.js'
        ],
        browsers: ['PhantomJS'],
        preprocessors: {'test/tests-main.js': ['webpack', 'sourcemap']},
        reporters: ['coverage', 'dots', 'coveralls'],
        coverageReporter: {
            type: 'lcovonly',
            dir: 'coverage/'
        },
        webpackMiddleware: {
           noInfo: true
        },
        webpack: webpackConfig.coverage,
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