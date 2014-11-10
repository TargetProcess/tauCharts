import {utils} from './utils/utils';
import {utilsDraw} from './utils/utils-draw';
import {TMatrix} from './matrix';


var specUnitSummary = (spec, boxOpt) => {
    var box = boxOpt ? boxOpt : {depth: -1, paddings: []};
    var p = (spec.guide || {}).padding || {l: 0, b: 0, r: 0, t: 0};
    box.depth += 1;
    box.paddings.unshift({l: p.l, b: p.b, r: p.r, t: p.t});

    if (spec.unit && spec.unit.length) {
        specUnitSummary(spec.unit[0], box);
    }

    return box;
};

var fnApplyDefaults = (rootNode) => {

    var fnTraverseLayout = (rawNode) => {

        var node = utilsDraw.applyNodeDefaults(rawNode);

        if (!node.$matrix) {
            return node;
        }

        node.$matrix.iterate((iRow, iCol, subNodes) => {
            subNodes.forEach(fnTraverseLayout);
        });

        return node;
    };

    return fnTraverseLayout(rootNode);
};


var fnDefaultLayoutEngine = (rootNode, domainMixin) => {

    var fnTraverseLayout = (rawNode) => {

        var node = utilsDraw.applyNodeDefaults(rawNode);

        if (!node.$matrix) {
            return node;
        }

        var options = node.options;
        var padding = node.guide.padding;

        var innerW = options.width - (padding.l + padding.r);
        var innerH = options.height - (padding.t + padding.b);

        var nRows = node.$matrix.sizeR();
        var nCols = node.$matrix.sizeC();

        var cellW = innerW / nCols;
        var cellH = innerH / nRows;

        var calcLayoutStrategy;
        if (node.guide.split) {
            calcLayoutStrategy = {
                calcHeight: ((cellHeight, rowIndex, elIndex, lenIndex) => cellHeight / lenIndex),
                calcTop: ((cellHeight, rowIndex, elIndex, lenIndex) => (rowIndex + 1) * (cellHeight / lenIndex) * elIndex)
            };
        }
        else {
            calcLayoutStrategy = {
                calcHeight: ((cellHeight, rowIndex, elIndex, lenIndex) => cellHeight),
                calcTop: ((cellHeight, rowIndex, elIndex, lenIndex) => rowIndex * cellH)
            };
        }

        node.$matrix.iterate((iRow, iCol, subNodes) => {

            var len = subNodes.length;

            _.each(
                subNodes,
                (node, i) => {
                    node.options = {
                        width: cellW,
                        left: iCol * cellW,
                        height: calcLayoutStrategy.calcHeight(cellH, iRow, i, len),
                        top: calcLayoutStrategy.calcTop(cellH, iRow, i, len)
                    };
                    fnTraverseLayout(node);
                });
        });

        return node;
    };

    return fnTraverseLayout(rootNode);
};

var LayoutEngineTypeMap = {

    'DEFAULT': fnDefaultLayoutEngine,

    'EXTRACT': (rootNode, domainMixin) => {

        var traverse = ((rootNodeMatrix, depth, rule) => {

            var matrix = rootNodeMatrix;

            var rows = matrix.sizeR();
            var cols = matrix.sizeC();

            matrix.iterate((r, c, subNodes) => {

                subNodes.forEach((unit) => {
                    return rule(unit, {
                        firstRow: (r === 0),
                        firstCol: (c === 0),
                        lastRow: (r === (rows - 1)),
                        lastCol: (c === (cols - 1)),
                        depth: depth
                    });
                });

                subNodes
                    .filter((unit) => unit.$matrix)
                    .forEach((unit) => {
                        unit.$matrix = new TMatrix(unit.$matrix.cube);
                        traverse(unit.$matrix, depth - 1, rule);
                    });
            });
        });

        var normalizedNode = fnApplyDefaults(rootNode);

        var coordNode = utils.clone(normalizedNode);

        var coordMatrix = new TMatrix([[[coordNode]]]);

        var box = specUnitSummary(coordNode);

        var globPadd = box.paddings.reduce(
            (memo, item) => {
                memo.l += item.l;
                memo.b += item.b;
                return memo;
            },
            {l: 0, b: 0});

        var temp = utils.clone(globPadd);
        var axesPadd = box.paddings.reverse().map((item) => {
            item.l = temp.l - item.l;
            item.b = temp.b - item.b;
            temp = {l: item.l, b: item.b};
            return item;
        });
        box.paddings = axesPadd.reverse();

        var wrapperNode = utilsDraw.applyNodeDefaults({
            type: 'COORDS.RECT',
            options: utils.clone(rootNode.options),
            $matrix: new TMatrix([[[coordNode]]]),
            guide: {
                padding: {
                    l: globPadd.l,
                    b: globPadd.b,
                    r: 0,
                    t: 0
                }
            }
        });

        traverse(coordMatrix, box.depth, (unit, selectorPredicates) => {

            var depth = selectorPredicates.depth;

            unit.guide.x.hide = !selectorPredicates.lastRow;
            unit.guide.y.hide = !selectorPredicates.firstCol;

            unit.guide.x.padding = (box.paddings[depth].b + unit.guide.x.padding);
            unit.guide.y.padding = (box.paddings[depth].l + unit.guide.y.padding);

            var d = (depth > 1) ? 0 : 8;
            unit.guide.padding.l = d;
            unit.guide.padding.b = d;
            unit.guide.padding.r = d;
            unit.guide.padding.t = d;

            unit.guide.showGridLines = (depth > 1) ? '' : 'xy';
            return unit;
        });

        return fnDefaultLayoutEngine(wrapperNode, domainMixin);
    },

    'SHARE-AXES': (rootNode, domainMixin) => {

        var traverse = ((node, level, wrapper) => {

            var arr = node.$matrix.getRC(0, 0);

            if (arr[0].$matrix) {
                wrapper.x[level] = wrapper.x[level] || {};
                wrapper.x[level][arr[0].x] = [];

                wrapper.y[level] = wrapper.y[level] || {};
                wrapper.y[level][arr[0].y] = [];
            }

            node.$matrix.iterate((r, c, subNodes) => {

                if (r === 0 || c === 0) {

                    let subNode = utilsDraw.applyNodeDefaults(subNodes[0]);

                    if (subNode.$matrix) {

                        let subAxis = _.extend(utils.clone(_.omit(subNode, '$matrix')), {type: 'WRAP.AXIS'});

                        if (r === 0) {
                            wrapper.x[level][subAxis.x].push(subAxis);
                        }

                        if (c === 0) {
                            wrapper.y[level][subAxis.y].push(subAxis);
                        }

                        traverse(subNode, level + 1, wrapper);
                    }
                }
            });

            return node;
        });

        var wrapperNode = utilsDraw.applyNodeDefaults({
            type: 'WRAPPER.SHARED.AXES',
            options: utils.clone(rootNode.options),
            x: [],
            y: [],
            $matrix: new TMatrix([[[rootNode]]])
        });

        var wrapper = traverse(domainMixin.mix(wrapperNode), 0, wrapperNode);

        var xW = wrapper.x.reduce((memo, level) => {
            Object.keys(level).forEach((k) => {
                memo += level[k][0].guide.padding.b;
            });
            return memo;
        }, 0);

        var yW = wrapper.y.reduce((memo, level) => {
            Object.keys(level).forEach((k) => {
                memo += level[k][0].guide.padding.l;
            });
            return memo;
        }, 0);

        rootNode.options.width = wrapperNode.options.width - yW;
        rootNode.options.height = wrapperNode.options.height - xW;

        rootNode = fnDefaultLayoutEngine(rootNode, domainMixin);

        return wrapper;
    },

    'EXTRACT-AXES': (rootNode, domainMixin) => {

        var fnExtractAxesTransformation = ((root) => {

            var traverse = ((rootNode, wrapperNode) => {

                var node = utilsDraw.applyNodeDefaults(rootNode);

                _.each([node.guide.x || {}, node.guide.y || {}], (a) => a.hide = true);

                var nRows = node.$matrix.sizeR();
                var nCols = node.$matrix.sizeC();

                wrapperNode.$axes = new TMatrix(nRows, nCols);

                node.$matrix.iterate((r, c, subNodes) => {

                    var axesMap = [];
                    wrapperNode.$axes.setRC(r, c, axesMap);

                    var isHeadCol = (c === 0);
                    var isTailRow = (r === (nRows - 1));

                    subNodes.forEach((subNode) => {
                        var node = utilsDraw.applyNodeDefaults(subNode);
                        if (node.$matrix) {
                            var axis = _.extend(utils.clone(_.omit(node, '$matrix')), { type: 'WRAP.AXIS' });
                            axesMap.push(axis);

                            node.guide.padding.l = 0;
                            node.guide.padding.b = 0;

                            axis.guide.padding.l = (isHeadCol ? axis.guide.padding.l : 0);
                            axis.guide.padding.b = (isTailRow ? axis.guide.padding.b : 0);

                            traverse(node, axis);
                        }
                    });
                });

                return node;
            });

            var wrapperNode = utilsDraw.applyNodeDefaults({
                type: 'WRAP.MULTI_AXES',
                options: utils.clone(root.options),
                x: {},
                y: {},
                $matrix: new TMatrix([[[root]]])
            });

            traverse(domainMixin.mix(wrapperNode), wrapperNode);

            wrapperNode.$matrix = new TMatrix([
                [
                    [
                        utilsDraw.applyNodeDefaults({
                            type: 'WRAP.MULTI_GRID',
                            x: {},
                            y: {},
                            $matrix: new TMatrix([[[root]]])
                        })
                    ]
                ]
            ]);

            return wrapperNode;
        });

        var fnTraverseExtAxesLayout = (wrapperNode) => {

            var multiAxisDecorator = (node) => {

                var options = node.options;
                var padding = node.guide.padding;

                var innerW = options.width - (padding.l + padding.r);
                var innerH = options.height - (padding.t + padding.b);

                var nR = node.$axes.sizeR();
                var nC = node.$axes.sizeC();

                var leftBottomItem = utilsDraw.applyNodeDefaults(node.$axes.getRC(nR - 1, 0)[0] || {});
                var lPadding = leftBottomItem.guide.padding.l;
                var bPadding = leftBottomItem.guide.padding.b;

                var sharedWidth = (innerW - lPadding);
                var sharedHeight = (innerH - bPadding);

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
                var padding = node.guide.padding;
                var nR = node.$axes.sizeR();
                node.$axes.iterate((iRow, iCol, subNodes) => {
                    if (iCol === 0 && (iRow === (nR - 1))) {
                        gridL += padding.l;
                        gridB += padding.b;
                        subNodes.forEach((node) => axisOffsetTraverser(node));
                    }
                });

                return node;
            };

            axisOffsetTraverser(wrapperNode);

            var gridW = wrapperNode.options.width - gridL;
            var gridH = wrapperNode.options.height - gridB;

            var refRoot = wrapperNode.$matrix.getRC(0, 0)[0];
            refRoot.options = {
                top: 0,
                left: gridL,
                width: gridW,
                height: gridH
            };

            fnDefaultLayoutEngine(refRoot, domainMixin);

            return wrapperNode;
        };

        return (fnTraverseExtAxesLayout(fnExtractAxesTransformation(rootNode)));
    }
};

var LayoutEngineFactory = {

    get: (typeName) => {
        return (LayoutEngineTypeMap[typeName] || LayoutEngineTypeMap.DEFAULT).bind(this);
    }

};

export {LayoutEngineFactory};