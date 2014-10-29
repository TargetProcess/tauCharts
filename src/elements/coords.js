import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';

var coords = function (node, continueTraverse) {

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
        period: node.x.guide.tickPeriod
    };
    node.x.scaleObj = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], tickX);

    var tickY = {
        map: node.y.guide.tickLabel,
        min: node.y.guide.tickMin,
        max: node.y.guide.tickMax,
        period: node.y.guide.tickPeriod
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
};
export {coords};