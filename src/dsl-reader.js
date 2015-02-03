export class DSLReader {

    constructor(domainMixin, UnitsRegistry) {
        this.domain = domainMixin;
        this.UnitsRegistry = UnitsRegistry;
    }

    buildGraph(spec) {
        var buildRecursively = (unit) => this.UnitsRegistry.get(unit.type).walk(this.domain.mix(unit), buildRecursively);
        return buildRecursively(spec.unit);
    }

    calcLayout(graph, size) {

        graph.options = {top: 0, left: 0, width: size.width, height: size.height};

        var fnTraverseLayout = (root) => {

            if (!root.$matrix) {
                return root;
            }

            root.childUnits = root.childUnits || [];
            root.$matrix.iterate((iRow, iCol, subNodes) => {
                subNodes.forEach((subNode) => {
                    subNode.options = {};
                    root.childUnits.push(subNode);
                    fnTraverseLayout(subNode);
                });
            });

            return root;
        };

        return fnTraverseLayout(graph);
    }

    renderGraph(styledGraph, target, xIterator, optimalSize) {

        var iterator = xIterator || ((x) => x);

        var renderRecursively = (unit, fnLayout) => {
            var unitMeta = this.domain.mix(unit);

            unitMeta.options = _.extend(unitMeta.options || {}, fnLayout(unitMeta));

            var newLayout = this.UnitsRegistry.get(unit.type).draw(unitMeta);

            var children = unit.childUnits || [];
            children.forEach((child) => {
                child.parentUnit = unit;
                renderRecursively(child, newLayout);
            });

            iterator(unitMeta);
        };

        styledGraph.parentUnit = null;
        renderRecursively(
            styledGraph,
            (unit) => ({
                container: target,
                left: 0,
                top: 0,
                width: optimalSize.width,
                height: optimalSize.height
            }));

        return styledGraph.options.container;
    }
}
