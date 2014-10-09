import {TMatrix} from './matrix';
import {TUnitVisitorFactory} from './unit-visitor-factory';
import {TNodeVisitorFactory} from './node-visitor-factory';
import {UnitDomainDecorator} from './unit-domain-decorator';
import {LayoutEngineFactory} from './layout-engine-factory';

export class DSLReader {

    constructor (spec, data) {
        this.spec = spec;
        this.domain = new UnitDomainDecorator(this.spec.dimensions, data);
    }

    buildGraph() {
        var buildRecursively = (unit) => TUnitVisitorFactory(unit.type)(this.domain.decorate(unit), buildRecursively);
        return buildRecursively(this.spec.unit);
    }

    calcLayout(graph, layoutEngine) {

        graph.options = {
            width: this.spec.W,
            height: this.spec.H,
            top: 0,
            left: 0
        };

        return layoutEngine(graph, this.domain);
    }

    renderGraph(styledGraph) {

        styledGraph.options.container = d3.select(this.spec.container)
            .append("svg")
            .style("border", 'solid 1px')
            .attr("width", this.spec.W)
            .attr("height", this.spec.H);

        var renderRecursively = (unit) => TNodeVisitorFactory(unit.type)(this.domain.decorate(unit), renderRecursively);

        renderRecursively(styledGraph);
        return styledGraph.options.container;
    }
}
