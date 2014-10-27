import {coords} from './elements/coords';
import {line} from './elements/line';
import {point} from './elements/point';
import {interval} from './elements/interval';
import {utils} from './utils/utils';
import {utilsDraw} from './utils/utils-draw';

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
        max: node.x.guide.tickMax
    };
    node.options.xScale = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], tickX);

    var tickY = {
        map: node.y.guide.tickLabel,
        min: node.y.guide.tickMin,
        max: node.y.guide.tickMax
    };
    node.options.yScale = node.y.scaleDim && node.scaleTo(node.y.scaleDim, [H, 0], tickY);

    return node;
};

var nodeMap = {

    'COORDS.RECT': (node, continueTraverse) => {
        node.x = node.dimension(node.x, node);
        node.y = node.dimension(node.y, node);
        coords(node, continueTraverse);
    },

    'ELEMENT.POINT': (node) => {
        point(setupElementNode(node, ['x', 'y', 'color', 'size']));
    },

    'ELEMENT.LINE': (node) => {
        line(setupElementNode(node, ['x', 'y', 'color']));
    },

    'ELEMENT.INTERVAL': function (node) {
        interval(setupElementNode(node, ['x', 'y']));
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
            max: node.x.guide.tickMax
        };
        node.x.scaleObj = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], tickX);

        var tickY = {
            map: node.y.guide.tickLabel,
            min: node.y.guide.tickMin,
            max: node.y.guide.tickMax
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
    },

    'COORDS.PARALLEL': function(node, continueTraverse) {

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

        var grid = container
            .append('g')
            .attr('class', 'grid')
            .attr('transform', translate(0, 0));

        node.$matrix.iterate((iRow, iCol, subNodes) => {
            subNodes.forEach((node) => {
                node.options = _.extend({container: grid}, node.options);
                continueTraverse(node);
            });
        });
    },

    'PARALLEL/ELEMENT.LINE': function(node) {

        node.color = node.dimension(node.color, node);

        var options = node.options;

        var scalesMap = node.x.reduce(
            (memo, xN) => {
                memo[xN] = node.scaleTo(xN, [options.height, 0], {});
                return memo;
            },
            {});

        var color = utilsDraw.generateColor(node);

        var categories = d3
            .nest()
            .key((d) => d[color.dimension])
            .entries(node.partition())
            .map((src) => {
                var row = src.values[0];
                var memo = [];
                node.x.forEach((propName) => {
                    memo.push({key: propName, val: row[propName]});
                });
                return memo;
            });

        var updateLines = function () {
            this.attr('class', (d) => 'graphical-report__' + 'line' + ' line ' + 'color10-9');
            var paths = this.selectAll('path').data((d) => [d]);
            paths.call(updatePaths);
            paths.enter().append('path').call(updatePaths);
            paths.exit().remove();
        };

        var segment = options.width / (node.x.length - 1);
        var segmentMap = {};
        node.x.forEach((propName, i) => {
            segmentMap[propName] = (i * segment);
        });

        var fnLine = d3.svg.line()
            .x((d) => segmentMap[d.key])
            .y((d) => scalesMap[d.key](d.val));

        var updatePaths = function () {
            this.attr('d', fnLine);
        };

        var lines = options.container.selectAll('.line').data(categories);
        lines.call(updateLines);
        lines.enter().append('g').call(updateLines);
        lines.exit().remove();
    }
};

export {nodeMap};
