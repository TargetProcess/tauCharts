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
    }
};

api.UnitsRegistry
    .add('COORDS.PARALLEL', nodeMap['COORDS.PARALLEL'])
    .add('PARALLEL/ELEMENT.LINE', nodeMap['PARALLEL/ELEMENT.LINE'])
    .add('COORDS.RECT', nodeMap['COORDS.RECT'])
    .add('ELEMENT.POINT', nodeMap['ELEMENT.POINT'])
    .add('ELEMENT.LINE', nodeMap['ELEMENT.LINE'])
    .add('ELEMENT.INTERVAL', nodeMap['ELEMENT.INTERVAL']);
export {Plot, Chart, __api__, api};



