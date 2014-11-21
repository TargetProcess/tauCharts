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

var LayoutEngineTypeMap = {

    'NONE': ((rootNode) => rootNode),

    'EXTRACT': (rootNode) => {

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

        var coordNode = utils.clone(rootNode);

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

        var distanceBetweenFacets = 10;

        var wrapperNode = utilsDraw.applyNodeDefaults({
            type: 'COORDS.RECT',
            options: utils.clone(rootNode.options),
            $matrix: new TMatrix([[[coordNode]]]),
            guide: {
                padding: {
                    l: globPadd.l - distanceBetweenFacets,
                    b: globPadd.b - distanceBetweenFacets,
                    r: 0,
                    t: 0
                }
            }
        });

        traverse(coordMatrix, box.depth, (unit, selectorPredicates) => {

            var depth = selectorPredicates.depth;

            unit.guide.x.hide = !selectorPredicates.lastRow;
            unit.guide.y.hide = !selectorPredicates.firstCol;

            var mid = (depth > 1) ? 0 : distanceBetweenFacets;
            var rev = (depth > 1) ? distanceBetweenFacets : 0;

            unit.guide.x.padding += (box.paddings[depth].b);
            unit.guide.y.padding += (box.paddings[depth].l);

            unit.guide.x.padding -= rev;
            unit.guide.y.padding -= rev;

            unit.guide.padding.l = mid;
            unit.guide.padding.b = mid;
            unit.guide.padding.r = mid;
            unit.guide.padding.t = mid;

            unit.guide.showGridLines = (depth > 1) ? '' : 'xy';
            return unit;
        });

        return wrapperNode;
    }
};

var LayoutEngineFactory = {

    get: ((typeName) => (LayoutEngineTypeMap[typeName] || LayoutEngineTypeMap.NONE))

};

export {LayoutEngineFactory};