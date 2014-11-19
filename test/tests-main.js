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
        'd3':'libs/d3',
        'jquery':'libs/jquery',
        'js-schema':'libs/js-schema',
        'underscore':'libs/underscore',
        'schemes':'test/utils/schemes',
        'testUtils':'test/utils/utils',
        'es5-shim':'libs/es5-shim',
        'brewer':'src/addons/color-brewer'
    },
    map: {
        '*': {
            'tauCharts': 'tau_modules/tau.newCharts'
        }
    },
    shim: {
      'js-schema':{
          deps:['libs/es5-shim'],
          exports:'schema'
      }
    },
    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});