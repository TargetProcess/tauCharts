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
import {GeoMap}     from './elements/coords.geomap';
import {Point}      from './elements/element.point';
import {Line}       from './elements/element.line';
import {Pie}        from './elements/element.pie';
import {Interval}   from './elements/element.interval';

import {ColorScale}     from './scales/color';
import {SizeScale}      from './scales/size';
import {OrdinalScale}   from './scales/ordinal';
import {PeriodScale}    from './scales/period';
import {TimeScale}      from './scales/time';
import {LinearScale}    from './scales/linear';
import {ValueScale}     from './scales/value';
import {FillScale}      from './scales/fill';

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

    .reg('ELEMENT.POINT', Point)
    .reg('ELEMENT.LINE', Line)
    .reg('ELEMENT.INTERVAL', Interval)

    .reg('RECT', Cartesian)
    .reg('POINT', Point)
    .reg('INTERVAL', Interval)
    .reg('LINE', Line)
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

export {GPL, Plot, Chart, __api__, api};