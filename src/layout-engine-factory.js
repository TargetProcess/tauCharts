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
    }
};

var LayoutEngineFactory = {

    get: (typeName) => {
        return (LayoutEngineTypeMap[typeName] || LayoutEngineTypeMap.DEFAULT).bind(this);
    }

};

export {LayoutEngineFactory};