module.exports = function(config) {
    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: '..',

        // frameworks to use
        frameworks: ['mocha','requirejs'],

        // list of files / patterns to load in the browser
        files: [
            /*'test/utils/utils.js',
            'libs/underscore.js',
            'libs/js-schema.js',
            'libs/d3.js',

            'src/addons/color-brewer.js',*/
            //'build/tauCharts.js',
            {pattern:'test/*test.js', included: false},
            'test/tests-main.js'
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