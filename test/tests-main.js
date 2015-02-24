var tests = [];
for (var file in window.__karma__.files) {
    if (/test.js$/.test(file)) {
        tests.push(file);
    }
}
requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base',
    paths: {
        'chai': 'node_modules/chai/chai',
        'd3': 'libs/d3',
        'jquery': 'libs/jquery',
        'js-schema': 'libs/js-schema',
        'modernizer': 'libs/modernizer',
        'underscore': 'libs/underscore',
        'schemes': 'test/utils/schemes',
        'testUtils': 'test/utils/utils',
        'es5-shim': 'libs/es5-shim',
        'brewer': 'src/addons/color-brewer'
    },
    map: {
        '*': {
            'tauCharts': 'tau_modules/tau.charts',
            'print.style.css': 'node_modules/requirejs-text/text!plugins/print.style.css',
            'rgbcolor': 'bower_components/canvg/rgbcolor',
            'stackblur': 'bower_components/canvg/StackBlur',
            'canvg': 'bower_components/canvg/canvg',
            'FileSaver': 'test/utils/saveAs',
            'fetch': 'bower_components/fetch/fetch',
            'promise': 'bower_components/es6-promise/promise'
        }
    },
    shim: {
        'js-schema': {
            deps: ['libs/es5-shim'],
            exports: 'schema'
        },
        '*': {
            deps: ['test/utils/mock.window']
        },
        'modernizer': {
            exports: 'Modernizr'
        }
    },
    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});