var tauCharts = require('src/tau.charts');

// setup global settings for tests
tauCharts.api.globalSettings.animationSpeed = 0;
tauCharts.api.globalSettings.renderingTimeout = 0;
tauCharts.api.globalSettings.asyncRendering = false;

// Setup font for tests
(function () {
    var s = document.createElement('style');
    s.textContent = [
        '* {',
        '    font-family: sans-serif !important;',
        '    font-style: normal !important;',
        '    font-weight: normal !important;',
        '}'
    ].join('\n');
    document.head.appendChild(s);
})();

var tests = [];
for (var file in window.__karma__.files) {
    if (/test.js$/.test(file)) {
        tests.push(file);
    }
}
var testsContext = require.context('.', true, /test\.js$/);
testsContext.keys().forEach(testsContext);