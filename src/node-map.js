import {coords} from './elements/coords';
import {utils} from './utils/utils';
import {utilsDraw} from './utils/utils-draw';
var nodeMap = {

    'COORDS.RECT': coords,

    'ELEMENT.POINT': function (node) {

        var filteredData = node.partition();
        var srcData = node.source();
        var defaultRange = ['color10-1', 'color10-2', 'color10-3', 'color10-4', 'color10-5', 'color10-6', 'color10-7', 'color10-8', 'color10-9', 'color10-10'];
        var getDefaultDomain = function () {
            return _(srcData).chain().pluck(node.color).uniq().value();
        };

        var options = node.options || {};
        options.xScale = node.scaleTo(node.x, [0, options.width]);
        options.yScale = node.scaleTo(node.y, [options.height, 0]);

        var range, domain, colorDim;
        var colorParam = node.color || '';
        colorDim = colorParam;
        if (utils.type(colorParam) === 'string') {
            range = defaultRange;
            domain = getDefaultDomain();
        } else if (utils.isArray(colorParam.brewer)) {
            range = colorParam.brewer;
            domain = colorParam.domain || getDefaultDomain();
            colorDim = colorParam.dimension;
        } else {
            domain = Object.keys(colorParam.brewer);
            range = domain.map((key) => colorParam.brewer[key]);
            colorDim = colorParam.dimension;
        }
        var color = d3.scale
            .ordinal()
            .range(range)
            .domain(domain);
        var maxAxis = _.max([options.width, options.height]);
        var sizeValues = _(srcData).chain().pluck(node.size).map((value)=>parseInt(value, 10));

        var size = d3
            .scale
            .linear()
            .range([maxAxis / 200, maxAxis / 100])
            .domain([
                sizeValues.min().value(),
                sizeValues.max().value()
            ]);

        var update = function () {
            return this
                .attr('r', function (d) {
                    var s = size(d[node.size]);
                    if (!_.isFinite(s)) {
                        s = maxAxis / 100;
                    }
                    return s;
                })
                .attr('class', function (d) {
                    return 'dot i-role-datum ' + color(d[colorDim]);
                })
                .attr('cx', function (d) {
                    return options.xScale(d[node.x]);
                })
                .attr('cy', function (d) {
                    return options.yScale(d[node.y]);
                });
        };

        var elements = options.container.selectAll('.dot').data(filteredData);
        elements.call(update);
        elements.exit().remove();
        elements.enter().append('circle').call(update);
    },

    'ELEMENT.INTERVAL': function (node) {

        var options = node.options || {};
        var barWidth = options.width / (node.domain(node.x).length) - 8;
        options.xScale = node.scaleTo(node.x, [0, options.width]);
        options.yScale = node.scaleTo(node.y, [options.height, 0]);

        var update = function () {
            return this
                .attr('class', 'i-role-datum  bar')
                .attr('x', function (d) {
                    return options.xScale(d[node.x]) - barWidth / 2;
                })
                .attr('width', barWidth)
                .attr('y', function (d) {
                    return options.yScale(d[node.y]);
                })
                .attr('height', function (d) {
                    return options.height - options.yScale(d[node.y]);
                });
        };


        var elements = options.container.selectAll(".bar").data(node.partition());
        elements.call(update);
        elements.enter().append('rect').call(update);
        elements.exit().remove();
    },

    'ELEMENT.LINE': function (node) {

        var options = node.options || {};
        options.xScale = node.scaleTo(node.x, [0, options.width]);
        options.yScale = node.scaleTo(node.y, [options.height, 0]);

        var line = d3
            .svg
            .line()
            .x(function (d) {
                return options.xScale(d[node.x]);
            })
            .y(function (d) {
                return options.yScale(d[node.y]);
            });

        options.container
            .append('g')
            .attr("class", "line")
            .attr('stroke', '#4daf4a')
            .append("path")
            .datum(node.partition())
            .attr("d", line);
    },

    'WRAP.AXIS': function (node, continueTraverse) {

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

        node.x.scale = node.x.scaleDim && node.scaleTo(node.x, [0, W]);
        node.y.scale = node.y.scaleDim && node.scaleTo(node.y, [H, 0]);

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
