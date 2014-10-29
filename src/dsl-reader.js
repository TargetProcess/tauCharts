import {utils} from './utils/utils';
import {UnitDomainMixin} from './unit-domain-mixin';
import {UnitsRegistry} from './units-registry';

export class DSLReader {

    constructor (spec, data) {
        this.spec = utils.clone(spec);
        this.domain = new UnitDomainMixin(this.spec.dimensions, data);
    }

    buildGraph() {
        var buildRecursively = (unit) => UnitsRegistry.get(unit.type).walk(this.domain.mix(unit), buildRecursively);
        return buildRecursively(this.spec.unit);
    }

    calcLayout(graph, layoutEngine, size) {

        graph.options = {
            top: 0,
            left: 0,
            width: size.width,
            height: size.height
        };

        return layoutEngine(graph, this.domain);
    }

    renderGraph(styledGraph, target) {

        styledGraph.options.container = target;

        var renderRecursively = (unit) => UnitsRegistry.get(unit.type).draw(this.domain.mix(unit), renderRecursively);

        renderRecursively(styledGraph);
        return styledGraph.options.container;
    }
}
