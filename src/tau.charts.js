import {utilsDom} from './utils/utils-dom';
import {utils} from './utils/utils';
import {GPL} from './charts/tau.gpl';
import {Plot} from './charts/tau.plot';
import {Chart} from './charts/tau.chart';
import {UnitDomainPeriodGenerator} from './unit-domain-period-generator';
import {FormatterRegistry} from './formatter-registry';
import {unitsRegistry} from './units-registry';
import {scalesRegistry} from './scales-registry';

import {Cartesian}  from './elements/coords.cartesian';
import {Parallel}   from './elements/coords.parallel';
import {GeoMap}     from './elements/coords.geomap';
import {Point}      from './elements/element.point';
import {Area}       from './elements/element.area';
import {Path}       from './elements/element.path';
import {Line}       from './elements/element.line';
import {Interval}   from './elements/element.interval';
import {StackedInterval}   from './elements/element.interval.stacked';
import {ParallelLine}      from './elements/element.parallel.line';

import {ColorScale}     from './scales/color';
import {SizeScale}      from './scales/size';
import {OrdinalScale}   from './scales/ordinal';
import {PeriodScale}    from './scales/period';
import {TimeScale}      from './scales/time';
import {LinearScale}    from './scales/linear';
import {ValueScale}     from './scales/value';
import {FillScale}      from './scales/fill';

import {chartTypesRegistry}     from './chart-alias-registry';
import {ChartMap}               from './api/chart-map';
import {ChartInterval}          from './api/chart-interval';
import {ChartScatterplot}       from './api/chart-scatterplot';
import {ChartLine}              from './api/chart-line';
import {ChartArea}              from './api/chart-area';
import {ChartIntervalStacked}   from './api/chart-interval-stacked';
import {ChartParallel}          from './api/chart-parallel';

import {errorCodes} from './error';
import {PluginsSDK} from './plugins-sdk';

import {default as _} from 'underscore';
import {default as d3} from 'd3';
var colorBrewers = {};
var plugins = {};

var __api__ = {
    UnitDomainPeriodGenerator: UnitDomainPeriodGenerator
};

var api = {
    errorCodes,
    unitsRegistry: unitsRegistry,
    scalesRegistry: scalesRegistry,
    tickFormat: FormatterRegistry,
    isChartElement: utils.isChartElement,
    isLineElement: utils.isLineElement,
    d3: d3,
    _: _,
    tickPeriod: UnitDomainPeriodGenerator,
    colorBrewers: {
        add: function (name, brewer) {
            if (!(name in colorBrewers)) {
                colorBrewers[name] = brewer;
            }
        },
        get: function (name) {
            return colorBrewers[name];
        }
    },
    pluginsSDK: PluginsSDK,
    plugins: {
        add: function (name, brewer) {
            if (!(name in plugins)) {
                plugins[name] = brewer;
            } else {
                throw new Error('Plugin is already registered.');
            }
        },
        get: function (name) {
            return plugins[name] || ((x) => {
                throw new Error(`${x} plugin is not defined`);
            });
        }
    },
    globalSettings: {

        log: (msg, type) => {
            type = type || 'INFO';
            if (!Array.isArray(msg)) {
                msg = [msg];
            }
            console[type.toLowerCase()].apply(console, msg);
        },

        facetLabelDelimiter: ' \u2192 ',
        excludeNull: true,
        specEngine: [
            {
                name: 'COMPACT',
                width: 600
            },
            {
                name: 'AUTO',
                width: Number.MAX_VALUE
            }
        ],

        fitModel: 'normal',
        optimizeGuideBySize: true,
        layoutEngine: 'EXTRACT',
        autoRatio: true,
        defaultSourceMap: [
            'https://raw.githubusercontent.com',
            'TargetProcess/tauCharts/master/src/addons',
            'world-countries.json'
        ].join('/'),

        getAxisTickLabelSize: _.memoize(utilsDom.getAxisTickLabelSize, (text) => (text || '').length),

        getScrollBarWidth: _.memoize(utilsDom.getScrollbarWidth),

        xAxisTickLabelLimit: 100,
        yAxisTickLabelLimit: 100,

        xTickWordWrapLinesLimit: 2,
        yTickWordWrapLinesLimit: 2,

        xTickWidth: 6 + 3,
        yTickWidth: 6 + 3,

        distToXAxisLabel: 20,
        distToYAxisLabel: 20,

        xAxisPadding: 20,
        yAxisPadding: 20,

        xFontLabelHeight: 10,
        yFontLabelHeight: 10,

        xDensityPadding: 4,
        yDensityPadding: 4,
        'xDensityPadding:measure': 8,
        'yDensityPadding:measure': 8,

        defaultFormats: {
            measure: 'x-num-auto',
            'measure:time': 'x-time-auto'
        }
    }
};

Plot.__api__ = api;
Plot.globalSettings = api.globalSettings;

[
    ['COORDS.RECT', Cartesian],
    ['COORDS.MAP', GeoMap],
    ['COORDS.PARALLEL', Parallel],
    ['ELEMENT.POINT', Point],
    ['ELEMENT.LINE', Line],
    ['ELEMENT.PATH', Path],
    ['ELEMENT.AREA', Area],
    ['ELEMENT.INTERVAL', Interval],
    ['ELEMENT.INTERVAL.STACKED', StackedInterval],
    ['PARALLEL/ELEMENT.LINE', ParallelLine]
].reduce((memo, nv) => (memo.reg(nv[0], nv[1])), api.unitsRegistry);

[
    ['color', ColorScale],
    ['fill', FillScale],
    ['size', SizeScale],
    ['ordinal', OrdinalScale],
    ['period', PeriodScale],
    ['time', TimeScale],
    ['linear', LinearScale],
    ['value', ValueScale]
].reduce((memo, nv) => (memo.reg(nv[0], nv[1])), api.scalesRegistry);

var commonRules = [
    ((config) => (!config.data) ? ['[data] must be specified'] : [])
];

api.chartTypesRegistry = chartTypesRegistry
    .add('scatterplot', ChartScatterplot, commonRules)
    .add('line', ChartLine, commonRules)
    .add('area', ChartArea, commonRules)
    .add('bar', (cfg) => ChartInterval(_.defaults({flip: false}, cfg)), commonRules)
    .add('horizontalBar', (cfg) => ChartInterval(_.defaults({flip: true}, cfg)), commonRules)
    .add('horizontal-bar', (cfg) => ChartInterval(_.defaults({flip: true}, cfg)), commonRules)
    .add('map', ChartMap, commonRules.concat([
        (config) => {
            var shouldSpecifyFillWithCode = (config.fill && config.code);
            if (config.fill && !shouldSpecifyFillWithCode) {
                return '[code] must be specified when using [fill]';
            }
        },
        (config) => {
            var shouldSpecifyBothLatLong = (config.latitude && config.longitude);
            if ((config.latitude || config.longitude) && !shouldSpecifyBothLatLong) {
                return '[latitude] and [longitude] both must be specified';
            }
        }
    ]))
    .add('stacked-bar', (cfg) => ChartIntervalStacked(_.defaults({flip: false}, cfg)), commonRules)
    .add('horizontal-stacked-bar', (cfg) => ChartIntervalStacked(_.defaults({flip: true}, cfg)), commonRules)
    .add('parallel', ChartParallel, commonRules.concat([
        (config) => {
            var shouldSpecifyColumns = (config.columns && config.columns.length > 1);
            if (!shouldSpecifyColumns) {
                return '[columns] property must contain at least 2 dimensions';
            }
        }
    ]));

export {GPL, Plot, Chart, __api__, api};