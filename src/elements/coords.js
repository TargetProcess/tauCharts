import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
import {utils} from '../utils/utils';
import {TMatrix} from '../matrix';

var FacetAlgebra = {

    'CROSS': function (root, dimX, dimY) {

        var domainX = root.domain(dimX);
        var domainY = root.domain(dimY).reverse();

        return _(domainY).map((rowVal) => {
            return _(domainX).map((colVal) => {

                var r = {};

                if (dimX) {
                    r[dimX] = colVal;
                }

                if (dimY) {
                    r[dimY] = rowVal;
                }

                return r;
            });
        });
    }
};

var TFuncMap = (opName) => FacetAlgebra[opName] || (() => [[{}]]);

var inheritRootProps = (unit, root, props) => {
    var r = _.defaults(utils.clone(unit), _.pick.apply(_, [root].concat(props)));
    r.guide = _.extend(utils.clone(root.guide || {}), (r.guide || {}));
    return r;
};

var coords = {

    walk: function (unit, continueTraverse) {

        var root = _.defaults(unit, {$where: {}});

        var isFacet = _.any(root.unit, (n) => (n.type.indexOf('COORDS.') === 0));
        var unitFunc = TFuncMap(isFacet ? 'CROSS' : '');

        var matrixOfPrFilters = new TMatrix(unitFunc(root, root.x, root.y));
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

    draw: function (node, continueTraverse) {

        var options = node.options;
        var padding = node.guide.padding;

        node.x.guide = node.guide.x;
        node.y.guide = node.guide.y;

        var L = options.left + padding.l;
        var T = options.top + padding.t;

        var W = options.width - (padding.l + padding.r);
        var H = options.height - (padding.t + padding.b);

        var tickX = {
            map: node.x.guide.tickLabel,
            min: node.x.guide.tickMin,
            max: node.x.guide.tickMax,
            period: node.x.guide.tickPeriod,
            tickAutoScale: node.x.guide.tickAutoScale
        };
        node.x.scaleObj = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], tickX);

        var tickY = {
            map: node.y.guide.tickLabel,
            min: node.y.guide.tickMin,
            max: node.y.guide.tickMax,
            period: node.y.guide.tickPeriod,
            tickAutoScale: node.y.guide.tickAutoScale
        };
        node.y.scaleObj = node.y.scaleDim && node.scaleTo(node.y.scaleDim, [H, 0], tickY);

        node.x.guide.size = W;
        node.y.guide.size = H;

        var X_AXIS_POS = [0, H + node.guide.x.padding];
        var Y_AXIS_POS = [0 - node.guide.y.padding, 0];

        var container = options
            .container
            .append('g')
            .attr('class', CSS_PREFIX + 'cell ' + 'cell')
            .attr('transform', utilsDraw.translate(L, T));

        if (!node.x.guide.hide) {
            utilsDraw.fnDrawDimAxis.call(container, node.x, X_AXIS_POS, W);
        }

        if (!node.y.guide.hide) {
            utilsDraw.fnDrawDimAxis.call(container, node.y, Y_AXIS_POS, H);
        }

        var grid = utilsDraw.fnDrawGrid.call(container, node, H, W);

        node.$matrix.iterate((iRow, iCol, subNodes) => {
            subNodes.forEach((node) => {
                node.options = _.extend({container: grid}, node.options);
                continueTraverse(node);
            });
        });
    }
};
export {coords};