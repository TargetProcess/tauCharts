import tauCharts from '../src/tau.charts';

// setup global settings for tests
tauCharts.api.globalSettings.animationSpeed = 0;
tauCharts.api.globalSettings.renderingTimeout = 0;
tauCharts.api.globalSettings.asyncRendering = false;
tauCharts.api.globalSettings.avoidScrollAtRatio = 1;
tauCharts.api.globalSettings.syncPointerEvents = true;
tauCharts.api.globalSettings.handleRenderingErrors = false;

// Todo: get all `*.test.js` files and insert imports via `rollup-plugin-glob-import`.
import './algebra.test';
import './api-chart.test';
import './bar-as-span-plugin.test';
import './chart-area.test';
import './data-processor.test';
import './event.test';
import './utils.test';
