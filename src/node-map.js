import {coords} from './elements/coords';
import {line} from './elements/line';
import {point} from './elements/point';
import {interval} from './elements/interval';
import {utilsDraw} from './utils/utils-draw';
import {CoordsParallel} from './elements/coords-parallel';
import {CoordsParallelLine} from './elements/coords-parallel-line';

var setupElementNode = (node, dimensions) => {

    dimensions.forEach((dimName) => {
        node[dimName] = node.dimension(node[dimName], node);
    });

    var options = node.options;

    var W = options.width;
    var H = options.height;

    node.x.guide = node.guide.x;
    node.y.guide = node.guide.y;

    var tickX = {
        map: node.x.guide.tickLabel,
        min: node.x.guide.tickMin,
        max: node.x.guide.tickMax,
        period: node.x.guide.tickPeriod,
        autoScale: node.x.guide.autoScale
    };
    node.options.xScale = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], tickX);

    var tickY = {
        map: node.y.guide.tickLabel,
        min: node.y.guide.tickMin,
        max: node.y.guide.tickMax,
        period: node.y.guide.tickPeriod,
        autoScale: node.y.guide.autoScale
    };
    node.options.yScale = node.y.scaleDim && node.scaleTo(node.y.scaleDim, [H, 0], tickY);

    return node;
};

var nodeMap = {

    'COORDS.RECT': {
        walk: coords.walk,
        draw: (node, continueTraverse) => {
            node.x = node.dimension(node.x, node);
            node.y = node.dimension(node.y, node);
            coords.draw(node, continueTraverse);
        }
    },

    'ELEMENT.POINT': (node) => {
        point(setupElementNode(node, ['x', 'y', 'color', 'size']));
    },

    'ELEMENT.LINE': (node) => {
        line(setupElementNode(node, ['x', 'y', 'color']));
    },

    'ELEMENT.INTERVAL': function (node) {
        interval(setupElementNode(node, ['x', 'y', 'color']));
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

        var tickX = {
            map: node.x.guide.tickLabel,
            min: node.x.guide.tickMin,
            max: node.x.guide.tickMax,
            autoScale: node.x.guide.autoScale
        };
        node.x.scaleObj = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], tickX);

        var tickY = {
            map: node.y.guide.tickLabel,
            min: node.y.guide.tickMin,
            max: node.y.guide.tickMax,
            autoScale: node.y.guide.autoScale
        };
        node.y.scaleObj = node.y.scaleDim && node.scaleTo(node.y.scaleDim, [H, 0], tickY);

        var X_AXIS_POS = [0, H + node.guide.x.padding];
        var Y_AXIS_POS = [0 - node.guide.y.padding, 0];

        var container = options
            .container
            .append('g')
            .attr('class', 'axis-container')
            .attr('transform', utilsDraw.translate(L, T));

        if (options.showX && !node.x.guide.hide) {
            utilsDraw.fnDrawDimAxis.call(container, node.x, X_AXIS_POS, W);
        }

        if (options.showY && !node.y.guide.hide) {
            utilsDraw.fnDrawDimAxis.call(container, node.y, Y_AXIS_POS, H);
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
    },

    'COORDS.PARALLEL': CoordsParallel,
    'PARALLEL/ELEMENT.LINE': CoordsParallelLine
};

export {nodeMap};
