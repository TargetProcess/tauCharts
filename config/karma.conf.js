module.exports = function(config) {
    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: '..',

        // frameworks to use
        frameworks: ['mocha', 'chai'],

        // list of files / patterns to load in the browser
        files: [
            'libs/es5-shim.js',
            'test/utils/utils.js',
            'libs/underscore.js',
            'libs/js-schema.js',
            'libs/d3.js',
            'build/tauCharts.js',
            'src/addons/color-brewer.js',
            'test/*.js'
        ],
        // test results reporter to use
        reporters: ['progress'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        logLevel: config.LOG_INFO,


        // Start these browsers
        browsers: ['PhantomJS'],

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true
    });
};