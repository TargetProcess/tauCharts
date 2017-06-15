import tauCharts from '../src/tau.charts';

// setup global settings for tests
tauCharts.api.globalSettings.animationSpeed = 0;
tauCharts.api.globalSettings.renderingTimeout = 0;
tauCharts.api.globalSettings.asyncRendering = false;
tauCharts.api.globalSettings.avoidScrollAtRatio = 1;
tauCharts.api.globalSettings.syncPointerEvents = true;
tauCharts.api.globalSettings.handleRenderingErrors = false;
tauCharts.api.globalSettings.experimentalShouldAnimate = () => true;

import './algebra.test.js';
import './api-chart.test.js';
import './bar-as-span-plugin.test.js';
import './chart-area.test.js';
import './chart-bar.test.js';
import './chart-config.test.js';
import './chart-facet.test.js';
import './chart-horizontal-bar.test.js';
import './chart-line.test.js';
// import './chart-map.test.js'; // fails
// import './chart-parallel.test.js'; // fails
import './chart-scatterplot.test.js';
import './d3-decorators.test.js';
import './data-processor.test.js';
import './element-area.test.js';
import './element-generic-cartesian.test.js';
import './element-interval-stacked.test.js';
import './element-interval.test.js';
import './element-line.test.js';
import './element-path.test.js';
import './element-point.test.js';
import './event.test.js';
import './export-plugin.test.js';
import './formatter-registry.test.js';
import './grammar-rules.test.js';
import './layer-titles-rules.test.js';
import './layers-plugin.test.js';
import './legend-plugin.test.js';
import './parallel-brushing-plugin.test.js';
import './plot.test.js';
import './pluginsdk.test.js';
import './quick-filter-plugin.test.js';
import './scales-factory.test.js';
import './size.test.js';
import './spec-converter.test.js';
import './spec-transform-auto-layout.test.js';
import './spec-transform-extract-axes.test.js';
import './task-runner.test.js';
import './tooltip-plugin.test.js';
import './trendline-plugin.test.js';
import './unit-domain-period-generator.test.js';
import './units-registry.test.js';
import './utils.path.test.js';
import './utils.test.js';
