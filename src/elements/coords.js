import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
import {utils} from '../utils/utils';
import {TMatrix} from '../matrix';

var FacetAlgebra = {

    'CROSS': function(root, dimX, domainX, dimY, domainY) {

        var domX = domainX.length === 0 ? [null] : domainX;
        var domY = domainY.length === 0 ? [null] : domainY.reverse();

        var convert = (v) => (v instanceof Date) ? v.getTime() : v;

        return _(domY).map((rowVal) => {
            return _(domX).map((colVal) => {

                var r = {};

                if (dimX) {
                    r[dimX] = convert(colVal);
                }

                if (dimY) {
                    r[dimY] = convert(rowVal);
                }

                return r;
            });
        });
    }
};

var TFuncMap = (opName) => FacetAlgebra[opName] || (() => [[{}]]);

var inheritRootProps = (unit, root, props) => {
    var r = _.defaults(utils.clone(unit), _.pick.apply(_, [root].concat(props)));
    r.guide = _.extend(utils.clone(root.guide), r.guide);
    return r;
};

var coords = {

    walk: function(unit, continueTraverse) {

        var root = _.defaults(unit, {$where: {}});

        var isFacet = _.any(root.unit, (n) => (n.type.indexOf('COORDS.') === 0));
        var unitFunc = TFuncMap(isFacet ? 'CROSS' : '');

        var domainX = root.scaleMeta(root.x, root.guide.x).values;
        var domainY = root.scaleMeta(root.y, root.guide.y).values;
        var matrixOfPrFilters = new TMatrix(unitFunc(root, root.x, domainX, root.y, domainY));
        var matrixOfUnitNodes = new TMatrix(matrixOfPrFilters.sizeR(), matrixOfPrFilters.sizeC());

        matrixOfPrFilters.iterate((row, col, $whereRC) => {
            var cellWhere = _.extend({}, root.$where, $whereRC);
            var cellNodes = _(root.unit).map((sUnit) => {
                return _.extend(inheritRootProps(sUnit, root, ['x', 'y']), {$where: cellWhere});
            });
            matrixOfUnitNodes.setRC(row, col, cellNodes);
        });

        root.$matrix = matrixOfUnitNodes;

        matrixOfUnitNodes.iterate((r, c, cellNodes) => {
            _.each(cellNodes, (refSubNode) => continueTraverse(refSubNode));
        });

        return root;
    },

    draw: function(node) {

        var options = node.options;
        var padding = node.guide.padding;

        node.x.guide = node.guide.x;
        node.y.guide = node.guide.y;

        var L = options.left + padding.l;
        var T = options.top + padding.t;

        var W = options.width - (padding.l + padding.r);
        var H = options.height - (padding.t + padding.b);

        node.x.scaleObj = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], node.x.guide);
        node.y.scaleObj = node.y.scaleDim && node.scaleTo(node.y.scaleDim, [H, 0], node.y.guide);

        node.x.guide.size = W;
        node.y.guide.size = H;

        var X_AXIS_POS = [0, H + node.guide.x.padding];
        var Y_AXIS_POS = [0 - node.guide.y.padding, 0];

        var container = options
            .container
            .append('g')
            .attr('class', CSS_PREFIX + 'cell ' + 'cell')
            .attr('transform', utilsDraw.translate(L, T))
            .datum({'$where': node.$where});

        if (!node.x.guide.hide) {
            utilsDraw.fnDrawDimAxis.call(container, node.x, X_AXIS_POS, W);
        }

        if (!node.y.guide.hide) {
            utilsDraw.fnDrawDimAxis.call(container, node.y, Y_AXIS_POS, H);
        }

        return utilsDraw.fnDrawGrid.call(container, node, H, W);
    }
};
export {coords};