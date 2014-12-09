import {utilsDom} from './utils/utils-dom';
import {Plot} from './charts/tau.plot';
import {Chart} from './charts/tau.chart';
import {UnitDomainMixin} from './unit-domain-mixin';
import {UnitDomainPeriodGenerator} from './unit-domain-period-generator';
import {DSLReader} from './dsl-reader';
import {SpecEngineFactory} from './spec-engine-factory';
import {LayoutEngineFactory} from './layout-engine-factory';
import {FormatterRegistry} from './formatter-registry';
import {nodeMap} from './node-map';
import {UnitsRegistry} from './units-registry';
var colorBrewers = {};
var plugins = {};

var __api__ = {
    UnitDomainMixin: UnitDomainMixin,
    UnitDomainPeriodGenerator: UnitDomainPeriodGenerator,
    DSLReader: DSLReader,
    SpecEngineFactory: SpecEngineFactory,
    LayoutEngineFactory: LayoutEngineFactory
};
var api = {
    UnitsRegistry: UnitsRegistry,
    tickFormat: FormatterRegistry,
    d3: d3,
    _: _,
    tickPeriod: UnitDomainPeriodGenerator,
    colorBrewers: {
        add: function(name, brewer) {
            if (!(name in colorBrewers)) {
                colorBrewers[name] = brewer;
            }
        },
        get: function(name) {
            return colorBrewers[name];
        }
    },
    plugins: {
        add: function(name, brewer) {
            if (!(name in plugins)) {
                plugins[name] = brewer;
            } else {
                throw new Error('Plugins is already registred.');
            }
        },
        get: function(name) {
            return plugins[name];
        }
    },
    globalSettings: {

        log: (msg, type) => {
            type = type || 'INFO';
            console.log(type + ': ' + msg);
        },

        excludeNull: true,
        specEngine: 'AUTO',
        layoutEngine: 'EXTRACT',
        getAxisTickLabelSize: utilsDom.getAxisTickLabelSize,

        xAxisTickLabelLimit: 100,
        yAxisTickLabelLimit: 100,

        xTickWordWrapLinesLimit: 2,
        yTickWordWrapLinesLimit: 3,

        xTickWidth: 6 + 3,
        yTickWidth: 6 + 3,

        distToXAxisLabel: 20,
        distToYAxisLabel: 20,

        xAxisPadding: 20,
        yAxisPadding: 20,

        xFontLabelHeight: 15,
        yFontLabelHeight: 15,

        xDensityKoeff: 2.2,
        xMinimumDensityKoeff: 1.1,
        yDensityKoeff: 2.2,
        yMinimumDensityKoeff: 1.1,

        defaultFormats: {
            'measure': 'x-num-auto',
            'measure:time': 'x-time-auto',
            'measure:time:year': 'x-time-year',
            'measure:time:quarter': 'x-time-quarter',
            'measure:time:month': 'x-time-month',
            'measure:time:week': 'x-time-week',
            'measure:time:day': 'x-time-day',
            'measure:time:hour': 'x-time-hour',
            'measure:time:min': 'x-time-min',
            'measure:time:sec': 'x-time-sec',
            'measure:time:ms': 'x-time-ms'
        }
    }
};

Plot.globalSettings = api.globalSettings;

api.UnitsRegistry
    .add('COORDS.PARALLEL', nodeMap['COORDS.PARALLEL'])
    .add('PARALLEL/ELEMENT.LINE', nodeMap['PARALLEL/ELEMENT.LINE'])
    .add('COORDS.RECT', nodeMap['COORDS.RECT'])
    .add('ELEMENT.POINT', nodeMap['ELEMENT.POINT'])
    .add('ELEMENT.LINE', nodeMap['ELEMENT.LINE'])
    .add('ELEMENT.INTERVAL', nodeMap['ELEMENT.INTERVAL']);
export {Plot, Chart, __api__, api};



