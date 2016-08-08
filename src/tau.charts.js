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
import {GenericCartesian} from './elements/element.generic.cartesian';
import {Point}      from './elements/element.point';
import {Area}       from './elements/element.area';
import {Path}       from './elements/element.path';
import {Line}       from './elements/element.line';
import {Interval}   from './elements/element.interval';
import {StackedInterval}   from './elements/element.interval.stacked';
import {ParallelLine}      from './elements/element.parallel.line';

import {IdentityScale}     from './scales/identity';
import {ColorScale}     from './scales/color';
import {SizeScale}      from './scales/size';
import {OrdinalScale}   from './scales/ordinal';
import {PeriodScale}    from './scales/period';
import {TimeScale}      from './scales/time';
import {LinearScale}    from './scales/linear';
import {LogarithmicScale}    from './scales/logarithmic';
import {ValueScale}     from './scales/value';
import {FillScale}      from './scales/fill';

import {chartTypesRegistry}     from './chart-alias-registry';
import {ChartMap}               from './api/chart-map';
import {ChartInterval}          from './api/chart-interval';
import {ChartScatterplot}       from './api/chart-scatterplot';
import {ChartLine}              from './api/chart-line';
import {ChartArea}              from './api/chart-area';
import {ChartParallel}          from './api/chart-parallel';
import {d3_animationInterceptor} from './utils/d3-decorators';

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
    d3_animationInterceptor: d3_animationInterceptor,
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

        animationSpeed: 750,

        defaultNiceColor: true,

        // jscs:disable
        defaultColorBrewer: ["#fde725", "#fbe723", "#f8e621", "#f6e620", "#f4e61e", "#f1e51d", "#efe51c", "#ece51b", "#eae51a", "#e7e419", "#e5e419", "#e2e418", "#dfe318", "#dde318", "#dae319", "#d8e219", "#d5e21a", "#d2e21b", "#d0e11c", "#cde11d", "#cae11f", "#c8e020", "#c5e021", "#c2df23", "#c0df25", "#bddf26", "#bade28", "#b8de29", "#b5de2b", "#b2dd2d", "#b0dd2f", "#addc30", "#aadc32", "#a8db34", "#a5db36", "#a2da37", "#a0da39", "#9dd93b", "#9bd93c", "#98d83e", "#95d840", "#93d741", "#90d743", "#8ed645", "#8bd646", "#89d548", "#86d549", "#84d44b", "#81d34d", "#7fd34e", "#7cd250", "#7ad151", "#77d153", "#75d054", "#73d056", "#70cf57", "#6ece58", "#6ccd5a", "#69cd5b", "#67cc5c", "#65cb5e", "#63cb5f", "#60ca60", "#5ec962", "#5cc863", "#5ac864", "#58c765", "#56c667", "#54c568", "#52c569", "#50c46a", "#4ec36b", "#4cc26c", "#4ac16d", "#48c16e", "#46c06f", "#44bf70", "#42be71", "#40bd72", "#3fbc73", "#3dbc74", "#3bbb75", "#3aba76", "#38b977", "#37b878", "#35b779", "#34b679", "#32b67a", "#31b57b", "#2fb47c", "#2eb37c", "#2db27d", "#2cb17e", "#2ab07f", "#29af7f", "#28ae80", "#27ad81", "#26ad81", "#25ac82", "#25ab82", "#24aa83", "#23a983", "#22a884", "#22a785", "#21a685", "#21a585", "#20a486", "#20a386", "#1fa287", "#1fa187", "#1fa188", "#1fa088", "#1f9f88", "#1f9e89", "#1e9d89", "#1e9c89", "#1e9b8a", "#1f9a8a", "#1f998a", "#1f988b", "#1f978b", "#1f968b", "#1f958b", "#1f948c", "#20938c", "#20928c", "#20928c", "#21918c", "#21908d", "#218f8d", "#218e8d", "#228d8d", "#228c8d", "#228b8d", "#238a8d", "#23898e", "#23888e", "#24878e", "#24868e", "#25858e", "#25848e", "#25838e", "#26828e", "#26828e", "#26818e", "#27808e", "#277f8e", "#277e8e", "#287d8e", "#287c8e", "#297b8e", "#297a8e", "#29798e", "#2a788e", "#2a778e", "#2a768e", "#2b758e", "#2b748e", "#2c738e", "#2c728e", "#2c718e", "#2d718e", "#2d708e", "#2e6f8e", "#2e6e8e", "#2e6d8e", "#2f6c8e", "#2f6b8e", "#306a8e", "#30698e", "#31688e", "#31678e", "#31668e", "#32658e", "#32648e", "#33638d", "#33628d", "#34618d", "#34608d", "#355f8d", "#355e8d", "#365d8d", "#365c8d", "#375b8d", "#375a8c", "#38598c", "#38588c", "#39568c", "#39558c", "#3a548c", "#3a538b", "#3b528b", "#3b518b", "#3c508b", "#3c4f8a", "#3d4e8a", "#3d4d8a", "#3e4c8a", "#3e4a89", "#3e4989", "#3f4889", "#3f4788", "#404688", "#404588", "#414487", "#414287", "#424186", "#424086", "#423f85", "#433e85", "#433d84", "#443b84", "#443a83", "#443983", "#453882", "#453781", "#453581", "#463480", "#46337f", "#46327e", "#46307e", "#472f7d", "#472e7c", "#472d7b", "#472c7a", "#472a7a", "#482979", "#482878", "#482677", "#482576", "#482475", "#482374", "#482173", "#482071", "#481f70", "#481d6f", "#481c6e", "#481b6d", "#481a6c", "#48186a", "#481769", "#481668", "#481467", "#471365", "#471164", "#471063", "#470e61", "#470d60", "#460b5e", "#460a5d", "#46085c", "#46075a", "#450559", "#450457", "#440256", "#440154"],
        // jscs:enable

        defaultClassBrewer: _.times(20, (i) => 'color20-' + (1 + i)),

        log: (msg, type) => {
            type = type || 'INFO';
            if (!Array.isArray(msg)) {
                msg = [msg];
            }
            console[type.toLowerCase()].apply(console, msg); // eslint-disable-line
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
        layoutEngine: 'EXTRACT',
        autoRatio: true,
        defaultSourceMap: [
            'https://raw.githubusercontent.com',
            'TargetProcess/tauCharts/master/src/addons',
            'world-countries.json'
        ].join('/'),

        getAxisTickLabelSize: _.memoize(utilsDom.getAxisTickLabelSize, (text) => (text || '').length),

        getScrollBarWidth: _.memoize(utilsDom.getScrollbarWidth),

        xAxisTickLabelLimit: 150,
        yAxisTickLabelLimit: 150,

        xTickWordWrapLinesLimit: 2,
        yTickWordWrapLinesLimit: 2,

        xTickWidth: 6 + 3,
        yTickWidth: 6 + 3,

        distToXAxisLabel: 10,
        distToYAxisLabel: 10,

        xAxisPadding: 20,
        yAxisPadding: 20,

        xFontLabelHeight: 10,
        yFontLabelHeight: 10,

        xDensityPadding: 2,
        yDensityPadding: 2,
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
    ['ELEMENT.GENERIC.CARTESIAN', GenericCartesian],
    ['ELEMENT.POINT', Point],
    ['ELEMENT.LINE', Line],
    ['ELEMENT.PATH', Path],
    ['ELEMENT.AREA', Area],
    ['ELEMENT.INTERVAL', Interval],
    ['ELEMENT.INTERVAL.STACKED', StackedInterval],
    ['PARALLEL/ELEMENT.LINE', ParallelLine]
].reduce((memo, nv) => (memo.reg(nv[0], nv[1])), api.unitsRegistry);

[
    [
        'identity',
        IdentityScale,
        ((config, settings) => _.defaults(
            config,
            {
                references: settings.references,
                refCounter: settings.refCounter
            }))
    ],
    [
        'color',
        ColorScale,
        ((config, settings) => _.defaults(
            config,
            {
                nice: settings.defaultNiceColor,
                brewer: (config.dimType === 'measure' ?
                        (settings.defaultColorBrewer) :
                        (settings.defaultClassBrewer)
                )
            }))
    ],
    ['fill', FillScale],
    ['size', SizeScale],
    ['ordinal', OrdinalScale],
    ['period', PeriodScale],
    ['time', TimeScale],
    ['linear', LinearScale],
    ['logarithmic', LogarithmicScale],
    ['value', ValueScale]
].reduce((memo, nv) => (memo.reg(...nv)), api.scalesRegistry);

var commonRules = [
    ((config) => (!config.data) ? ['[data] must be specified'] : [])
];

api.chartTypesRegistry = chartTypesRegistry

    .add('scatterplot', ChartScatterplot, commonRules)
    .add('line', ChartLine, commonRules)

    .add('area', ChartArea, commonRules)
    .add('stacked-area', (cfg) => ChartArea(_.defaults(cfg, {stack: true})), commonRules)

    .add('bar', (cfg) => ChartInterval(_.defaults(cfg, {flip: false})), commonRules)
    .add('horizontalBar', (cfg) => ChartInterval(_.defaults({flip: true}, cfg)), commonRules)
    .add('horizontal-bar', (cfg) => ChartInterval(_.defaults({flip: true}, cfg)), commonRules)
    .add('stacked-bar', (cfg) => ChartInterval(_.defaults({flip: false, stack: true}, cfg)), commonRules)
    .add('horizontal-stacked-bar', (cfg) => ChartInterval(_.defaults({flip: true, stack: true}, cfg)), commonRules)

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
    .add('parallel', ChartParallel, commonRules.concat([
        (config) => {
            var shouldSpecifyColumns = (config.columns && config.columns.length > 1);
            if (!shouldSpecifyColumns) {
                return '[columns] property must contain at least 2 dimensions';
            }
        }
    ]));

/* global VERSION:false */
var version = VERSION;

export {GPL, Plot, Chart, __api__, api, version};