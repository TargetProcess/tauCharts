import {TMatrix} from './matrix';
import {TUnitVisitorFactory} from './unit-visitor-factory';
import {TNodeVisitorFactory} from './node-visitor-factory';

var SCALE_STRATEGIES = {

    'ordinal': (domain) => domain,

    'linear': (domain) => d3.extent(domain)
};

var getRangeMethod = (scaleType) => ((scaleType === 'ordinal') ? 'rangeRoundBands' : 'rangeRound');

var metaFilter = (filterPredicates, row) => _.every(filterPredicates, (fnPredicate) => fnPredicate(row));

var decorateUnit = function(unit, meta, rawData) {

    unit.source = (filter) => _(rawData).filter(filter || (() => true));

    unit.partition = () => unit.source(metaFilter.bind(null, unit.$filter));

    // TODO: memoize
    unit.domain = (dim) => _(rawData).chain().pluck(dim).uniq().value();

    unit.scaleTo = (scaleDim, interval) =>
    {
        var temp = _.isString(scaleDim) ? { scaleDim: scaleDim } : scaleDim;
        var dimx = _.defaults(temp, meta[temp.scaleDim]);

        var type = dimx.scaleType;
        var vals = unit.domain(dimx.scaleDim);
        return d3.scale[type]().domain(SCALE_STRATEGIES[type](vals))[getRangeMethod(type)](interval, 0.1);
    };

    return unit;
};

var DSLReader = function (ast) {
    this.ast = ast;
};

DSLReader.prototype = {

    traverse: function (rawData, styleEngine) {

        var meta = this.ast.dimensions;

        var isLCol = (r, c) => (c === 0);
        var isTRow = (r, c) => (r === 0);

        var transformationExtractAxes = ((root) => {

            var traverse = ((node, refWrapper) =>
            {
                if (!node.$matrix) {
                    return node;
                }

                if (!node.skipForcePadding) {
                    node.padding = { L:0, B:0, R:0, T:0 };
                }

                _.each(node.axes, (a, i) => a.hide = true);

                var row = [];
                var col = [];
                refWrapper.x.push(row);
                refWrapper.y.push(col);

                node.$matrix.iterate((r, c, subNodes) => {
                    subNodes.forEach((node) => {

                        if (r === 0 && c === 0) {
                            refWrapper.padding.L += node.padding.L;
                            refWrapper.padding.B += node.padding.B;
                        }

                        var space = _.extend({}, node.padding);

                        if (node.axes && isTRow(r, c)) {
                            row.push(_.extend({ space: space }, node.axes[0]));
                        }

                        if (node.axes && isLCol(r, c)) {
                            col.push(_.extend({ space: space }, node.axes[1]));
                        }

                        traverse(node, refWrapper);
                    });
                });

                return node;
            });

            var wrapperNode = {
                type: 'WRAP.MULTI_AXES',
                options: _.extend({}, root.options),
                axes: [],
                padding: { L:0, R:0, T:0, B:0 },
                skipForcePadding: true,
                x: [],
                y: [],
                $matrix: new TMatrix([
                    [
                        [root]
                    ]
                ])
            };

            return traverse(decorateUnit(wrapperNode, meta, rawData), wrapperNode);
        });

        var styleDecorator = styleEngine || ((node) =>
        {

            if (!node.$matrix) {
                return node;
            }

            var options = node.options || {};
            var padding = _.defaults(node.padding || {}, { L:0, B:0, R:0, T:0 });

            var W = options.width  - (padding.L + padding.R);
            var H = options.height - (padding.T + padding.B);

            var nR = node.$matrix.sizeR();
            var nC = node.$matrix.sizeC();

            var cellW = W / nC;
            var cellH = H / nR;

            node.$matrix.iterate((iRow, iCol, subNodes) =>
            {
                subNodes.forEach((node) =>
                {
                    node.options = {
                        width: cellW,
                        height: cellH,
                        top: iRow * cellH,
                        left: iCol * cellW
                    };
                    styleDecorator(node);
                });
            });

            return node;
        });

        var buildLogicalGraphRecursively = (unitRef) =>
        {
            return TUnitVisitorFactory(unitRef.type)(decorateUnit(unitRef, meta, rawData), buildLogicalGraphRecursively);
        };

        var unit = this.ast.unit;
        unit.options = {
            width: this.ast.W,
            height: this.ast.H,
            top: 0,
            left: 0
        };

        return (styleDecorator(transformationExtractAxes(buildLogicalGraphRecursively(unit))));
    },

    traverseToNode: function (refUnit, rawData) {

        this.container =  d3
            .select(this.ast.container)
            .append("svg")
            .style("border", 'solid 1px')
            .attr("width", this.ast.W)
            .attr("height", this.ast.H);

        refUnit.options.container = this.container;

        var renderLogicalGraphRecursively = (unit) =>
        {
            return TNodeVisitorFactory(unit.type)(unit, renderLogicalGraphRecursively);
        };

        renderLogicalGraphRecursively(refUnit);

        return refUnit.options.container;
    }
};

export {DSLReader};
