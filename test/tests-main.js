var tauCharts = require('src/tau.charts');

// setup global settings for tests
tauCharts.api.globalSettings.animationSpeed = 0;
tauCharts.api.globalSettings.renderingTimeout = 0;
tauCharts.api.globalSettings.asyncRendering = false;
tauCharts.api.globalSettings.avoidScrollAtRatio = 1;
tauCharts.api.globalSettings.syncPointerEvents = true;
tauCharts.api.globalSettings.handleRenderingErrors = false;

var testsContext = require.context('.', true, /test\.js$/);
testsContext.keys().forEach(testsContext);