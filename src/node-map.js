import {coords} from './elements/coords';
import {line} from './elements/line';
import {point} from './elements/point';
import {utils} from './utils/utils';
import {utilsDraw} from './utils/utils-draw';
var nodeMap = {

    'COORDS.RECT': (node, continueTraverse) => {
        node.x = node.dimension(node.x, node);
        node.y = node.dimension(node.y, node);
        coords(node, continueTraverse);
    },

    'ELEMENT.POINT': (node) => {
        node.x = node.dimension(node.x, node);
        node.y = node.dimension(node.y, node);
        node.color = node.dimension(node.color, node);
        node.size = node.dimension(node.size, node);
        point(node);
    },

    'ELEMENT.LINE': (node) => {
        node.x = node.dimension(node.x, node);
        node.y = node.dimension(node.y, node);
        node.color = node.dimension(node.color, node);
        line(node);
    },

    'ELEMENT.INTERVAL': function (node) {
        node.x = node.dimension(node.x, node);
        node.y = node.dimension(node.y, node);

        var options = node.options;
        var barWidth = options.width / (node.domain(node.x.scaleDim).length) - 8;
        var xScale = node.scaleTo(node.x.scaleDim, [0, options.width]);
        var yScale = node.scaleTo(node.y.scaleDim, [options.height, 0]);

        var update = function () {
            return this
                .attr('class', 'i-role-datum  bar')
                .attr('x', (d) => xScale(d[node.x.scaleDim]) - barWidth / 2)
                .attr('y', (d) => yScale(d[node.y.scaleDim]))
                .attr('width', barWidth)
                .attr('height', (d) => options.height - yScale(d[node.y.scaleDim]));
        };

        var elements = options.container.selectAll(".bar").data(node.partition());
        elements.call(update);
        elements.enter().append('rect').call(update);
        elements.exit().remove();
    },

    'WRAP.AXIS': function (node, continueTraverse) {

        node.x = node.dimension(node.x, node);
        node.y = node.dimension(node.y, node);

        var options = node.options;
        var padding = node.guide.padding;

        node.x.guide = node.guide.x;
        node.y.guide = node.guide.y;

        var L = options.left + padding.l;
        var T = options.top + padding.t;

        var W = options.width - (padding.l + padding.r);
        var H = options.height - (padding.t + padding.b);

        node.x.guide.size = W;
        node.y.guide.size = H;

        node.x.scaleObj = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], node.x.guide.name);
        node.y.scaleObj = node.y.scaleDim && node.scaleTo(node.y.scaleDim, [H, 0], node.y.guide.name);

        var X_AXIS_POS = [0, H + node.guide.x.padding];
        var Y_AXIS_POS = [0 - node.guide.y.padding, 0];

        var container = options
            .container
            .append('g')
            .attr('class', 'axis-container')
            .attr('transform', utilsDraw.translate(L, T));

        if (options.showX && !node.x.guide.hide) {
            var domainXLength = node.domain(node.x.scaleDim).length;
            utilsDraw.fnDrawDimAxis.call(container, node.x, X_AXIS_POS, W / domainXLength, W);
        }

        if (options.showY && !node.y.guide.hide) {
            var domainYLength = node.domain(node.y.scaleDim).length;
            utilsDraw.fnDrawDimAxis.call(container, node.y, Y_AXIS_POS, H / domainYLength, H);
        }

        var grid = container
            .append('g')
            .attr('class', 'sub-axis-container')
            .attr('transform', utilsDraw.translate(0, 0));

        var nRows = node.$axes.sizeR();
        var nCols = node.$axes.sizeC();

        node.$axes.iterate((iRow, iCol, subNodes) => {
            if (iCol === 0 || (iRow === (nRows - 1))) {
                subNodes.forEach((node) => {
                    node.options = _.extend(
                        {
                            container: grid
                        },
                        node.options || {});

                    if (node.$axes) {
                        continueTraverse(node);
                    }
                });
            }
        });
    },

    'WRAP.MULTI_AXES': function (node, continueTraverse) {
        var options = node.options;
        var padding = node.guide.padding;

        var L = options.left + padding.l;
        var T = options.top + padding.t;

        var W = options.width - (padding.l + padding.r);
        var H = options.height - (padding.t + padding.b);

        var container = options
            .container
            .append('g')
            .attr('class', 'cell-wrapper')
            .attr('transform', utilsDraw.translate(L, T));

        node.$axes.iterate((r, c, subAxesNodes) => {
            subAxesNodes.forEach((node) => {
                node.options = _.extend({container: container}, node.options);
                continueTraverse(node);
            });
        });

        node.$matrix.iterate((r, c, subNodes) => {
            subNodes.forEach((node) => {
                node.options = _.extend({container: container}, node.options);
                continueTraverse(node);
            });
        });
    },

    'WRAP.MULTI_GRID': function (node, continueTraverse) {
        var options = node.options;
        var padding = node.guide.padding;

        var L = options.left + padding.l;
        var T = options.top + padding.t;

        var grid = options
            .container
            .append('g')
            .attr('class', 'grid-wrapper')
            .attr('transform', utilsDraw.translate(L, T));

        node.$matrix.iterate((r, c, subNodes) => {
            subNodes.forEach((node) => {
                node.options = _.extend({container: grid}, node.options);
                continueTraverse(node);
            });
        });
    }
};

export {nodeMap};
