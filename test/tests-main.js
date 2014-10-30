var tests = [];
debugger
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
        'es5-shim':'libs/es5-shim.js'/*,
        'tauChart':'build/tauCharts.js'*/
    },
    shim: {
      'tauChart':{
          exports:'tauChart'
      }
    },
    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});