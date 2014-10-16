import {Chartillo} from './charts/tau.chartillo';
import {Chart} from './charts/tau.chart';
import {UnitDomainMixin} from './unit-domain-mixin';
import {DSLReader} from './dsl-reader';
import {LayoutEngineFactory} from './layout-engine-factory';


var tauChart = {
    Chartillo: Chartillo,
    Chart: Chart,
    __api__: {
        UnitDomainMixin: UnitDomainMixin,
        DSLReader: DSLReader,
        LayoutEngineFactory: LayoutEngineFactory
    }
};

export {tauChart};