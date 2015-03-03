export class DSLReader {

    constructor(domainMixin, unitsRegistry) {
        this.domain = domainMixin;
        this.unitsRegistry = unitsRegistry;
    }

    buildGraph(spec) {
        var buildRecursively = (unit) => this.unitsRegistry
            .get(unit.type)
            .walk(this.domain.mix(unit), buildRecursively);
        return buildRecursively(spec.unit);
    }

    calcLayout(graph, size) {

        graph.options = {top: 0, left: 0, width: size.width, height: size.height};

        var fnTraverseLayout = (root) => {

            if (!root.$matrix) {
                return root;
            }

            var options = root.options;
            var padding = root.guide.padding;

            var innerW = options.width - (padding.l + padding.r);
            var innerH = options.height - (padding.t + padding.b);

            var nRows = root.$matrix.sizeR();
            var nCols = root.$matrix.sizeC();

            var cellW = innerW / nCols;
            var cellH = innerH / nRows;

            var calcLayoutStrategy;
            if (root.guide.split) {
                calcLayoutStrategy = {
                    calcHeight: ((cellHeight, rowIndex, elIndex, lenIndex) => cellHeight / lenIndex),
                    calcTop: (
                        (cellHeight, rowIndex, elIndex, lenIndex) => (rowIndex + 1) *
                        (cellHeight / lenIndex) *
                        elIndex
                    )
                };
            } else {
                calcLayoutStrategy = {
                    calcHeight: ((cellHeight, rowIndex, elIndex, lenIndex) => cellHeight),
                    calcTop: ((cellHeight, rowIndex, elIndex, lenIndex) => rowIndex * cellH)
                };
            }

            root.childUnits = root.childUnits || [];
            root.$matrix.iterate((iRow, iCol, subNodes) => {
                var len = subNodes.length;
                subNodes.forEach((subNode, i) => {
                    subNode.options = {
                        width: cellW,
                        left: iCol * cellW,
                        height: calcLayoutStrategy.calcHeight(cellH, iRow, i, len),
                        top: calcLayoutStrategy.calcTop(cellH, iRow, i, len)
                    };
                    root.childUnits.push(subNode);
                    fnTraverseLayout(subNode);
                });
            });

            return root;
        };

        return fnTraverseLayout(graph);
    }

    renderGraph(styledGraph, target, xIterator) {
        var iterator = xIterator || ((x) => x);
        styledGraph.options.container = target;
        var renderRecursively = (unit) => {
            var unitMeta = this.domain.mix(unit);
            var subSpace = this.unitsRegistry.get(unit.type).draw(unitMeta);

            var children = unit.childUnits || [];
            children.forEach((child) => {
                child.options = _.extend({container: subSpace}, child.options);
                child.parentUnit = unit;
                renderRecursively(child);
            });

            iterator(unitMeta);
        };
        styledGraph.parentUnit = null;
        renderRecursively(styledGraph);
        return styledGraph.options.container;
    }
}
