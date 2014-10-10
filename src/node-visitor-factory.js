var TNodeVisitorFactory = (function () {

    var translate = (left, top) => 'translate(' + left + ',' + top + ')';

    var fnDrawDimAxis = function (x, AXIS_POSITION, CSS_CLASS) {
        var container = this;
        if (x.scaleDim) {
            container
                .append('g')
                .attr('class', CSS_CLASS)
                .attr('transform', translate.apply(null, AXIS_POSITION))
                .call(d3.svg.axis().scale(x.scale).orient(x.scaleOrient));
        }
    };

    var fnDrawGrid = function (node, H, W) {

        var container = this;

        var grid = container
            .append('g')
            .attr('class', 'grid')
            .attr('transform', translate(0, 0));

        var linesOptions = (node.guide.showGridLines || '').toLowerCase();
        if (linesOptions.length > 0) {

            var gridLines = grid.append('g').attr('class', 'grid-lines');

            if ((linesOptions.indexOf('x') > -1) && node.axes[0]) {
                var x = node.axes[0];
                var xGridAxis = d3
                    .svg
                    .axis()
                    .scale(x.scale)
                    .orient(x.scaleOrient)
                    .tickSize(H);

                gridLines.append('g').call(xGridAxis);
            }

            if ((linesOptions.indexOf('y') > -1) && node.axes[1]) {
                var y = node.axes[1];
                var yGridAxis = d3
                    .svg
                    .axis()
                    .scale(y.scale)
                    .orient(y.scaleOrient)
                    .tickSize(-W);

                gridLines.append('g').call(yGridAxis);
            }

            // TODO: make own axes and grid instead of using d3's in such tricky way
            gridLines.selectAll('text').remove();
        }

        return grid;
    };

    var TNodeMap = {

        'COORDS.RECT': function (node, continueTraverse) {

            var options = node.options;
            var padding = node.guide.padding;

            var axes = _(node.axes).map(function (axis, i) {
                var a = _.isArray(axis) ? axis : [axis];
                a[0] = _.defaults(
                    a[0] || {},
                    {
                        scaleOrient: (i === 0 ? 'bottom' : 'left'),
                        padding: 0
                    });
                return a;
            });

            var x = axes[0][0];
            var y = axes[1][0];

            var L = options.left + padding.L;
            var T = options.top + padding.T;

            var W = options.width - (padding.L + padding.R);
            var H = options.height - (padding.T + padding.B);

            var xScale = x.scaleDim && node.scaleTo(x, [0, W]);
            var yScale = y.scaleDim && node.scaleTo(y, [H, 0]);

            axes[0][0].scale = xScale;
            axes[1][0].scale = yScale;

            var X_AXIS_POS = [0, H + x.padding];
            var Y_AXIS_POS = [0 - y.padding, 0];

            var container = options
                .container
                .append('g')
                .attr('class', 'cell')
                .attr('transform', translate(L, T));

            if (!x.hide) {
                fnDrawDimAxis.call(container, x, X_AXIS_POS, 'x axis');
            }

            if (!y.hide) {
                fnDrawDimAxis.call(container, y, Y_AXIS_POS, 'y axis');
            }

            var grid = fnDrawGrid.call(container, node, H, W);

            node.$matrix.iterate((iRow, iCol, subNodes) => {
                subNodes.forEach((node) => {
                    node.options = _.extend({container: grid}, node.options);
                    continueTraverse(node);
                });
            });
        },

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
            colorDim = node.color;
            if (_.isObject(node.color)) {
                range = node.color.range || defaultRange;
                domain = node.color.domain || getDefaultDomain();
                colorDim = node.color.dimension;
            } else {
                range = defaultRange;
                domain = getDefaultDomain();
            }
            var color = d3.scale
                .ordinal()
                .range(range)
                .domain(domain);
            var maxAxis = _.max([options.width, options.height]);
            var sizeValues = _(srcData).chain().pluck(node.size);
            var size = d3
                .scale
                .linear()
                .range([maxAxis/200, maxAxis/100])
                .domain([
                    sizeValues.min().value(),
                    sizeValues.max().value()
                ]);

            var update = function () {
                return this
                    .attr('r', function (d) {
                        var s = size(d[node.size]);
                        if (_.isNaN(s)) {
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
            options.xScale = node.scaleTo(node.x, [0, options.width]);
            options.yScale = node.scaleTo(node.y, [options.height, 0]);

            var update = function () {
                return this
                    .attr('class', 'i-role-datum  bar')
                    .attr('x', function (d) {
                        return options.xScale(d[node.x]);
                    })
                    .attr('width', options.xScale.rangeBand())
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

            var axes = _(node.axes).map(function (axis, i) {
                var a = _.isArray(axis) ? axis : [axis];
                a[0] = _.defaults(
                    a[0] || {},
                    {
                        scaleOrient: (i === 0 ? 'bottom' : 'left'),
                        padding: 0
                    });
                return a;
            });

            var x = axes[0][0];
            var y = axes[1][0];

            var L = options.left + padding.L;
            var T = options.top + padding.T;

            var W = options.width - (padding.L + padding.R);
            var H = options.height - (padding.T + padding.B);

            var xScale = x.scaleDim && node.scaleTo(x, [0, W]);
            var yScale = y.scaleDim && node.scaleTo(y, [H, 0]);

            axes[0][0].scale = xScale;
            axes[1][0].scale = yScale;

            var X_AXIS_POS = [0, H + x.padding];
            var Y_AXIS_POS = [0 - y.padding, 0];

            var container = options
                .container
                .append('g')
                .attr('class', 'axis-container')
                .attr('transform', translate(L, T));

            if (options.showX && !x.hide) {
                fnDrawDimAxis.call(container, x, X_AXIS_POS, 'x axis');
            }

            if (options.showY && !y.hide) {
                fnDrawDimAxis.call(container, y, Y_AXIS_POS, 'y axis');
            }

            var grid = container
                .append('g')
                .attr('class', 'sub-axis-container')
                .attr('transform', translate(0, 0));

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

            var L = options.left + padding.L;
            var T = options.top + padding.T;

            var W = options.width - (padding.L + padding.R);
            var H = options.height - (padding.T + padding.B);

            var container = options
                .container
                .append('g')
                .attr('class', 'cell-wrapper')
                .attr('transform', translate(L, T));

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

            var L = options.left + padding.L;
            var T = options.top + padding.T;

            var grid = options
                .container
                .append('g')
                .attr('class', 'grid-wrapper')
                .attr('transform', translate(L, T));

            node.$matrix.iterate((r, c, subNodes) => {
                subNodes.forEach((node) => {
                    node.options = _.extend({container: grid}, node.options);
                    continueTraverse(node);
                });
            });
        }
    };

    return function (unitType) {

        if (!TNodeMap.hasOwnProperty(unitType)) {
            throw new Error('Unknown unit type: ' + unitType);
        }

        return TNodeMap[unitType];
    };

})();

export {TNodeVisitorFactory};
