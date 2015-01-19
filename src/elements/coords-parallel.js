import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
import {utils} from '../utils/utils';
import {TMatrix} from '../matrix';

var inheritRootProps = (unit, root, props) => {
    var r = _.defaults(utils.clone(unit), _.pick.apply(_, [root].concat(props)));
    r.guide = _.extend(utils.clone(root.guide || {}), (r.guide || {}));
    return r;
};

var CoordsParallel = {

    walk: function (unit, continueTraverse) {
        var root = _.defaults(unit, {$where: {}});

        var matrixOfPrFilters = new TMatrix(1, 1);
        var matrixOfUnitNodes = new TMatrix(1, 1);

        matrixOfPrFilters.iterate((row, col) => {
            var cellWhere = _.extend({}, root.$where);
            var cellNodes = _(root.unit).map((sUnit) => {
                return _.extend(inheritRootProps(sUnit, root, ['x']), {$where: cellWhere});
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

        var L = options.left + padding.l;
        var T = options.top + padding.t;

        var W = options.width - (padding.l + padding.r);
        var H = options.height - (padding.t + padding.b);

        var scaleObjArr = node.x.map((xN) => node.scaleTo(xN, [H, 0], {}));

        var container = options
            .container
            .append('g')
            .attr('class', 'graphical-report__' + 'cell ' + 'cell')
            .attr('transform', utilsDraw.translate(L, T));


        var translate = (left, top) => 'translate(' + left + ',' + top + ')';
        var rotate = (angle) => 'rotate(' + angle + ')';


        var fnDrawDimAxis = function (xScaleObj, AXIS_POSITION) {
            var container = this;

            var axisScale = d3.svg.axis().scale(xScaleObj).orient('left');

            var nodeScale = container
                .append('g')
                .attr('class', 'y axis')
                .attr('transform', translate.apply(null, AXIS_POSITION))
                .call(axisScale);

            nodeScale
                .selectAll('.tick text')
                .attr('transform', rotate(0))
                .style('text-anchor', 'end');
        };

        var offset = W / (node.x.length - 1);
        scaleObjArr.forEach((scale, i) => {
            fnDrawDimAxis.call(container, scale, [i * offset, 0]);
        });

        return container
            .append('g')
            .attr('class', 'grid')
            .attr('transform', translate(0, 0));
    }
};
export {CoordsParallel};