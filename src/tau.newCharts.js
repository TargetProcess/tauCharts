import {Chart} from './charts/tau.chart';
import {Scatterplot} from './charts/tau.scatterplot';
import {UnitDomainMixin} from './unit-domain-mixin';
import {DSLReader} from './dsl-reader';


var tauChart = {
    Chart: Chart,
    Scatterplot: Scatterplot,

    __api__: {
        UnitDomainMixin: UnitDomainMixin,
        DSLReader: DSLReader
    }
};

export {tauChart};