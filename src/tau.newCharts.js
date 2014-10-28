import {Plot} from './charts/tau.plot';
import {Chart} from './charts/tau.chart';
import {UnitDomainMixin} from './unit-domain-mixin';
import {UnitDomainPeriodGenerator} from './unit-domain-period-generator';
import {DSLReader} from './dsl-reader';
import {LayoutEngineFactory} from './layout-engine-factory';


var tauChart = {
    Plot: Plot,
    Chart: Chart,
    __api__: {
        UnitDomainMixin: UnitDomainMixin,
        UnitDomainPeriodGenerator: UnitDomainPeriodGenerator,
        DSLReader: DSLReader,
        LayoutEngineFactory: LayoutEngineFactory
    }
};

export {tauChart};