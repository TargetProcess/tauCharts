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

var cloneNodeSettings = (node) => {
    var obj = _.omit(node, '$matrix');
    return JSON.parse(JSON.stringify(obj));
};

var DSLReader = function (ast) {
    this.ast = ast;
};

DSLReader.prototype = {

    traverse: function (rawData, styleEngine) {

        var meta = this.ast.dimensions;

        var multiAxisDecoratorFasade = (wrapperNode) => {

            var multiAxisDecorator = (node) => {

                if (!node.$axes) {
                    return node;
                }

                var options = node.options || {};
                var padding = _.defaults(node.padding || {}, {L: 0, B: 0, R: 0, T: 0});

                var W = options.width - (padding.L + padding.R);
                var H = options.height - (padding.T + padding.B);

                var nR = node.$axes.sizeR();
                var nC = node.$axes.sizeC();

                var leftBottomItem = (node.$axes.getRC(nR - 1, 0)[0] || { padding: { L:0, T:0, R:0, B:0 } });
                var lPadding = leftBottomItem.padding.L;
                var bPadding = leftBottomItem.padding.B;

                var sharedWidth = (W - lPadding);
                var sharedHeight = (H - bPadding);

                var cellW = sharedWidth / nC;
                var cellH = sharedHeight / nR;

                node.$axes.iterate((iRow, iCol, subNodes) => {

                    var isHeadCol = (iCol === 0);
                    var isTailRow = (iRow === (nR - 1));

                    if (isHeadCol || isTailRow) {

                        subNodes.forEach((node) => {
                            node.options = {
                                showX: isTailRow,
                                showY: isHeadCol,

                                width : cellW + (isHeadCol ? lPadding: 0),
                                height: cellH + (isTailRow ? bPadding: 0),

                                top : iRow * cellH,
                                left: iCol * cellW + (isHeadCol ? 0 : lPadding)
                            };

                            if (node.$axes) {
                                multiAxisDecorator(node);
                            }
                        });
                    }
                });

                return node;
            };

            multiAxisDecorator(wrapperNode);


            var gridL = 0;
            var gridB = 0;
            var axisOffsetTraverser = (node) => {

                if (!node.$axes) {
                    return node;
                }

                var padding = node.padding;
                var nR = node.$axes.sizeR();
                node.$axes.iterate((iRow, iCol, subNodes) => {
                    if (iCol === 0 && (iRow === (nR - 1))) {
                        gridL += padding.L;
                        gridB += padding.B;
                        subNodes.forEach((node) => axisOffsetTraverser(node));
                    }
                });

                return node;
            };

            axisOffsetTraverser(wrapperNode);

            var gridW = wrapperNode.options.width - gridL;
            var gridH = wrapperNode.options.height - gridB;

            var root = wrapperNode.$matrix.getRC(0, 0)[0];
            root.options = {
                top: 0,
                left: gridL,
                width: gridW,
                height: gridH
            };

            styleDecorator(root);

            return wrapperNode;
        };

        var transformationExtractAxes = ((root) => {

            var traverse = ((node, wrapperNode) =>
            {
                if (!node.$matrix) {
                    return node;
                }

                _.each(node.axes, (a, i) => a.hide = true);

                var nRows = node.$matrix.sizeR();
                var nCols = node.$matrix.sizeC();

                wrapperNode.$axes = new TMatrix(nRows, nCols);

                node.$matrix.iterate((r, c, subNodes) => {

                    var multiAxesNodes = [];
                    wrapperNode.$axes.setRC(r, c, multiAxesNodes);

                    var isHeadCol = (c === 0);
                    var isTailRow = (r === (nRows - 1));

                    subNodes.forEach((node) => {
                        if (node.$matrix) {
                            var nodeAxis = _.extend(cloneNodeSettings(node), { type: 'WRAP.AXIS' });
                            multiAxesNodes.push(nodeAxis);

                            node.padding.L = 0;
                            node.padding.B = 0;

                            nodeAxis.padding.L = (isHeadCol ? nodeAxis.padding.L : 0);
                            nodeAxis.padding.B = (isTailRow ? nodeAxis.padding.B : 0);

                            traverse(node, nodeAxis);
                        }
                    });
                });

                return node;
            });

            var wrapperNode = {
                type: 'WRAP.MULTI_AXES',
                padding: { L:0, R:0, T:0, B:0 },
                options: cloneNodeSettings(root.options),
                $matrix: new TMatrix([[[root]]])
            };

            traverse(decorateUnit(wrapperNode, meta, rawData), wrapperNode);

            wrapperNode.$matrix = new TMatrix([
                [
                    [
                        {
                            type: 'WRAP.MULTI_GRID',
                            padding: {L: 0, R: 0, T: 0, B: 0},
                            options: {},
                            $matrix: new TMatrix([[[root]]])
                        }
                    ]
                ]
            ]);

            return wrapperNode;
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

        //return (styleDecorator(buildLogicalGraphRecursively(unit)));
        return (multiAxisDecoratorFasade(transformationExtractAxes(buildLogicalGraphRecursively(unit))));
    },

    traverseToNode: function (refUnit, rawData) {

        var meta = this.ast.dimensions;

        this.container =  d3
            .select(this.ast.container)
            .append("svg")
            .style("border", 'solid 1px')
            .attr("width", this.ast.W)
            .attr("height", this.ast.H);

        refUnit.options.container = this.container;

        var renderLogicalGraphRecursively = (unit) =>
        {
            return TNodeVisitorFactory(unit.type)(decorateUnit(unit, meta, rawData), renderLogicalGraphRecursively);
        };

        renderLogicalGraphRecursively(refUnit);

        return refUnit.options.container;
    }
};

export {DSLReader};
