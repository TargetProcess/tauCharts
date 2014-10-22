import {utilsDraw} from '../utils/utils-draw';
var coords = function (node, continueTraverse) {

    var options = node.options;
    var padding = node.guide.padding;

    node.x.guide = node.guide.x;
    node.y.guide = node.guide.y;

    var L = options.left + padding.l;
    var T = options.top + padding.t;

    var W = options.width - (padding.l + padding.r);
    var H = options.height - (padding.t + padding.b);

    node.x.scaleObj = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], node.x.guide.tickLabel);
    node.y.scaleObj = node.y.scaleDim && node.scaleTo(node.y.scaleDim, [H, 0], node.y.guide.tickLabel);

    node.x.guide.size = W;
    node.y.guide.size = H;

    var X_AXIS_POS = [0, H + node.guide.x.padding];
    var Y_AXIS_POS = [0 - node.guide.y.padding, 0];

    var container = options
        .container
        .append('g')
        .attr('class', 'cell')
        .attr('transform', utilsDraw.translate(L, T));

    if (!node.x.guide.hide) {
        var domainXLength = node.domain(node.x.scaleDim).length;
        utilsDraw.fnDrawDimAxis.call(container, node.x, X_AXIS_POS, W / domainXLength, W);
    }

    if (!node.y.guide.hide) {
        var domainYLength = node.domain(node.y.scaleDim).length;
        utilsDraw.fnDrawDimAxis.call(container, node.y, Y_AXIS_POS, H / domainYLength, H);
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