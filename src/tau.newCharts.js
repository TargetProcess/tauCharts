import {Chart} from './charts/tau.chart';
import {Scatterplot} from './charts/tau.scatterplot';
import {UnitDomainMixin} from './unit-domain-mixin';
import {DSLReader} from './dsl-reader';
import {LayoutEngineFactory} from './layout-engine-factory';


var tauChart = {
    Chart: Chart,
    Scatterplot: Scatterplot,

    __api__: {
        UnitDomainMixin: UnitDomainMixin,
        DSLReader: DSLReader,
        LayoutEngineFactory: LayoutEngineFactory
    }
};

export {tauChart};