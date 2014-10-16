import {Chartillo} from './charts/tau.chartillo';
import {Scatterplot} from './charts/tau.scatterplot';
import {UnitDomainMixin} from './unit-domain-mixin';
import {DSLReader} from './dsl-reader';
import {LayoutEngineFactory} from './layout-engine-factory';


var tauChart = {
    Chartillo: Chartillo,
    Chart: Scatterplot,

    __api__: {
        UnitDomainMixin: UnitDomainMixin,
        DSLReader: DSLReader,
        LayoutEngineFactory: LayoutEngineFactory
    }
};

export {tauChart};