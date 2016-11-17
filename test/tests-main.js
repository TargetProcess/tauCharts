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
        '    font-family: Open Sans !important;',
        '    src: url("data:application/x-font-woff;base64,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") format("woff");',
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