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
    globalSettings: {
        specEngine: 'AUTO',
        layoutEngine: 'EXTRACT',
        getAxisTickLabelSize: utilsDom.getAxisTickLabelSize,
        axisTickLabelLimit: 100,
        xTickWidth: 6 + 3,
        distToXAxisLabel: 20,
        distToYAxisLabel: 20,
        xAxisPadding: 20,
        yAxisPadding: 20,
        xFontLabelHeight: 15,
        yFontLabelHeight: 15,
        densityKoeff: 2.2,
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



