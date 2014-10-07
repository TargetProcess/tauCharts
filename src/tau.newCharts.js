import {Chart} from './charts/tau.chart';
import {Scatterplot} from './charts/tau.scatterplot';
import {UnitDomainDecorator} from './unit-domain-decorator';


var tauChart = {
    Chart: Chart,
    Scatterplot: Scatterplot,

    __api__: {
        UnitDomainDecorator: UnitDomainDecorator
    }
};

export {tauChart};