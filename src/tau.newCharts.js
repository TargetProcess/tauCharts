import {Plot} from './charts/tau.plot';
import {Chart} from './charts/tau.chart';
import {UnitDomainMixin} from './unit-domain-mixin';
import {UnitDomainPeriodGenerator} from './unit-domain-period-generator';
import {DSLReader} from './dsl-reader';
import {LayoutEngineFactory} from './layout-engine-factory';
import {FormatterRegistry} from './formatter-registry';
import {nodeMap} from './node-map';
import {UnitsRegistry} from './units-registry';


var tauChart = {
    Plot: Plot,
    Chart: Chart,
    __api__: {
        UnitDomainMixin: UnitDomainMixin,
        UnitDomainPeriodGenerator: UnitDomainPeriodGenerator,
        DSLReader: DSLReader,
        LayoutEngineFactory: LayoutEngineFactory
    },
    api: {
        UnitsRegistry: UnitsRegistry,
        tickFormat: FormatterRegistry,
        tickPeriod: UnitDomainPeriodGenerator
    }
};

tauChart.api.UnitsRegistry
    .add('COORDS.PARALLEL', nodeMap['COORDS.PARALLEL'])
    .add('PARALLEL/ELEMENT.LINE', nodeMap['PARALLEL/ELEMENT.LINE'])
    .add('COORDS.RECT', nodeMap['COORDS.RECT'])
    .add('ELEMENT.POINT', nodeMap['ELEMENT.POINT'])
    .add('ELEMENT.LINE', nodeMap['ELEMENT.LINE'])
    .add('ELEMENT.INTERVAL', nodeMap['ELEMENT.INTERVAL'])
    .add('WRAP.AXIS', nodeMap['WRAP.AXIS'])
    .add('WRAP.MULTI_AXES', nodeMap['WRAP.MULTI_AXES'])
    .add('WRAP.MULTI_GRID', nodeMap['WRAP.MULTI_GRID']);

export {tauChart};