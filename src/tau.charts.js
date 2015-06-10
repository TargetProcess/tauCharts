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
import {Line}       from './elements/element.line';
import {Pie}        from './elements/element.pie';
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

import {ChartTypesRegistry}     from './chart-alias-registry';
import {ChartMap}               from './api/chart-map';
import {ChartInterval}          from './api/chart-interval';
import {ChartScatterplot}       from './api/chart-scatterplot';
import {ChartLine}              from './api/chart-line';
import {ChartIntervalStacked}   from './api/chart-interval-stacked';
import {ChartParallel}          from './api/chart-parallel';

var colorBrewers = {};
var plugins = {};

var __api__ = {
    UnitDomainPeriodGenerator: UnitDomainPeriodGenerator
};
var api = {
    unitsRegistry: unitsRegistry,
    scalesRegistry: scalesRegistry,
    tickFormat: FormatterRegistry,
    isChartElement:utils.isChartElement,
    isLineElement:utils.isLineElement,
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

Plot.globalSettings = api.globalSettings;

api.unitsRegistry
    .reg('COORDS.RECT', Cartesian)
    .reg('COORDS.MAP', GeoMap)
    .reg('COORDS.PARALLEL', Parallel)

    .reg('ELEMENT.POINT', Point)
    .reg('ELEMENT.LINE', Line)
    .reg('ELEMENT.INTERVAL', Interval)
    .reg('ELEMENT.INTERVAL.STACKED', StackedInterval)

    .reg('RECT', Cartesian)
    .reg('POINT', Point)
    .reg('INTERVAL', Interval)
    .reg('LINE', Line)

    .reg('PARALLEL/ELEMENT.LINE', ParallelLine)
    .reg('PIE', Pie);

api.scalesRegistry
    .reg('color', ColorScale)
    .reg('fill', FillScale)
    .reg('size', SizeScale)
    .reg('ordinal', OrdinalScale)
    .reg('period', PeriodScale)
    .reg('time', TimeScale)
    .reg('linear', LinearScale)
    .reg('value', ValueScale);

var commonRules = [
    ((config) => (!config.data) ? ['[data] must be specified'] : [])
];

ChartTypesRegistry
    .add('scatterplot', ChartScatterplot, commonRules)
    .add('line', ChartLine, commonRules)
    .add('bar', (cfg) => ChartInterval(_.defaults({flip:false}, cfg)), commonRules)
    .add('horizontalBar', (cfg) => ChartInterval(_.defaults({flip:true}, cfg)), commonRules)
    .add('horizontal-bar', (cfg) => ChartInterval(_.defaults({flip:true}, cfg)), commonRules)
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
    .add('stacked-bar', (cfg) => ChartIntervalStacked(_.defaults({flip:false}, cfg)), commonRules)
    .add('horizontal-stacked-bar', (cfg) => ChartIntervalStacked(_.defaults({flip:true}, cfg)), commonRules)
    .add('parallel', ChartParallel, commonRules.concat([
        (config) => {
            var shouldSpecifyColumns = (config.columns && config.columns.length > 1);
            if (!shouldSpecifyColumns) {
                return '[columns] property must contain at least 2 dimensions';
            }
        }
    ]));

export {GPL, Plot, Chart, __api__, api};