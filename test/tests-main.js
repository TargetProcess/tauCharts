var tauCharts = require('src/tau.charts');

// setup global settings for tests
tauCharts.api.globalSettings.animationSpeed = 0;
tauCharts.api.globalSettings.renderingTimeout = 0;

var tests = [];
for (var file in window.__karma__.files) {
    if (/test.js$/.test(file)) {
        tests.push(file);
    }
}
var testsContext = require.context('.', true, /test\.js$/);
testsContext.keys().forEach(testsContext);