import {Chart} from './charts/tau.chart';
import {Scatterplot} from './charts/tau.scatterplot';
import {UnitDomainDecorator} from './unit-domain-decorator';
import {DSLReader} from './dsl-reader';


var tauChart = {
    Chart: Chart,
    Scatterplot: Scatterplot,

    __api__: {
        UnitDomainDecorator: UnitDomainDecorator,
        DSLReader: DSLReader
    }
};

export {tauChart};