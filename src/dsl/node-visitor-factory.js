var TNodeVisitorFactory = (function () {

    var translate = function (left, top) {
        return 'translate(' + left + ',' + top + ')';
    };

    var getRangeMethod = function (scaleType) {
        return ((scaleType === 'ordinal') ? 'rangeRoundBands' : 'rangeRound');
    };
    var getBubbleAxis = function (node) {
        var cube = node.$matrix.cube[0];
        if (cube && cube[0] && cube[0][0].axes && cube[0][0].axes[0] && cube[0][0].axes[0].bubble) {
            return {
                $scales: cube[0][0].$scales,
                axes: cube[0][0].axes
            };
        } else {
            return {axes: []};
        }
    };

    var drawNestedAxes = function (nestedAxesConfig, container, srcData, dimensions, sizes) {
        container = container.append('g').attr("class", "axes nest");
        var nestedAxes = nestedAxesConfig;
        var groupX = _.chain(srcData).map(function (item) {
            return item[dimensions.x];
        }).unique().value();

        var groupY = _.chain(srcData).map(function (item) {
            return item[dimensions.y];
        }).unique().value();


        var xs = nestedAxes.axes[0];
        var xScales = nestedAxes.$scales[xs.scaleDim][getRangeMethod(xs.scaleType)]([0, sizes.width - sizes.paddingX*2], 0.1);
        // xScales.
        container.selectAll(".x.axis.nest")
            .data(groupX)
            .enter().append("g")
            .attr("class", "x axis nest")
            .attr("transform", function (d, ind) {
                return "translate(" + ((ind) * sizes.width + sizes.paddingY) + "," + sizes.containerHeight + ")";
            })
            .each(function (d) {
                d3.select(this).call(d3.svg.axis().scale(xScales).orient('bottom'));
            }
        );
        var ys = nestedAxes.axes[1];
        var yScales = nestedAxes.$scales[ys.scaleDim][getRangeMethod(ys.scaleType)]([sizes.height - sizes.paddingY*2, 0], 0.1);
        container.selectAll(".y.axis.nest")
            .data(groupY)
            .enter().append("g")
            .attr("class", "y axis nest")
            .attr("transform", function (d, ind) {
                return "translate(" + 0 + "," + (ind * sizes.height + sizes.paddingY/2) + ")";
            })
            .each(function (d) {
                d3.select(this).call(d3.svg.axis().scale(yScales).orient('left'));
            }
        );
    };

    var TNodeMap = {

        'COORDS/RECT': function (node, filteredData, srcData, continueTraverse) {
            var options = node.options || {};
            var axes = node.axes;
            var x = _.defaults(axes[0] || {}, {scaleOrient: 'bottom'});
            var y = _.defaults(axes[1] || {}, {scaleOrient: 'left'});
            var PX = 36;
            var PY = 18;
            var paddingForNestedX = 5;
            var paddingForNestedY = 5;
            var bubbleAxes = getBubbleAxis(node);
            var existBubbleAxes = bubbleAxes.axes.length;
            if (x.bubble === true && y.bubble === true) {
                PX = paddingForNestedX;
                PY = paddingForNestedY;
            } else {
                if (existBubbleAxes) {
                    PX = 56;
                    PY = 30;
                }
            }
            var W = options.width - 2 * PX;
            var H = options.height - 2 * PY;


            this.container = options
                .container
                .append('g')
                .attr('class', 'cell')
                .attr('transform', translate(options.left + PX, options.top + PY / 2));


            var xScale;
            if (x.scaleDim) {
                xScale = node.$scales[x.scaleDim][getRangeMethod(x.scaleType)]([0, W], 0.1);
                if (x.bubble !== true) {
                    var xAxis = d3.svg.axis().scale(xScale).orient(x.scaleOrient);
                    this.container
                        .append('g')
                        .attr('class', 'x axis nest')
                        .attr('transform', translate(0, H + 25))
                        .call(xAxis);
                }
            }

            var yScale;
            if (y.scaleDim) {
                yScale = node.$scales[y.scaleDim][getRangeMethod(y.scaleType)]([H, 0], 0.1);
                if (y.bubble !== true) {
                    var yAxis = d3.svg.axis().scale(yScale).orient(y.scaleOrient);
                    this.container
                        .append('g')
                        .attr('class', 'y axis')
                        .attr('transform', translate(-25, 0))
                        .call(yAxis);
                }
            }

            if (node.showGrid) {

                var grids = this.container.insert('g', ':first-child').attr('class', 'grids');

                if (xScale) {
                    var xGridAxis = d3.svg.axis()
                        .scale(xScale)
                        .orient(x.scaleOrient)
                        .tickSize(H);

                    grids.append('g').call(xGridAxis);
                }

                if (yScale) {
                    var yGridAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient(y.scaleOrient)
                        .tickSize(-W);

                    grids.append('g').call(yGridAxis);
                }

                // TODO: make own axes and grid instead of using d3's in such tricky way
                grids.selectAll('text').remove();
            }

            var grid = this.container
                .append('g')
                .attr('class', 'grid')
                .attr('transform', translate(0, 0));

            var nR = node.$matrix.sizeR();
            var nC = node.$matrix.sizeC();

            var cellW = W / nC;
            var cellH = H / nR;
            if(existBubbleAxes) {
                drawNestedAxes(
                    bubbleAxes,
                    this.container,
                    filteredData,
                    {
                        x: x.scaleDim,
                        y: y.scaleDim
                    },
                    {
                        width: cellW,
                        height: cellH,
                        containerHeight: H,
                        paddingX:paddingForNestedX,
                        paddingY:paddingForNestedY
                    }
                );
            }


            node.$matrix.iterate(function (iRow, iCol, subNodes) {
                subNodes.forEach(function (node) {

                    node.options = {
                        container: grid,
                        width: cellW,
                        height: cellH,
                        top: iRow * cellH,
                        left: iCol * cellW,
                        xScale: xScale,
                        yScale: yScale
                    };

                    continueTraverse(node, srcData);
                });
            });
        },

        'ELEMENT/POINT': function (unit, filteredData, srcData) {

            var options = unit.options || {};

            var color = tau
                .data
                .scale
                .color10()
                .domain(_(srcData).chain().pluck(unit.color).uniq().value());

            var size = d3
                .scale
                .linear()
                .range([0, options.width / 100])
                .domain([
                    0,
                    _(srcData).chain().pluck(unit.size).max().value()
                ]);

            var update = function () {
                return this
                    .attr('r', function (d) {
                        var s = size(d[unit.size]);
                        if (_.isNaN(s)) {
                            s = options.width / 100;
                        }
                        return s;
                    })
                    .attr('class', function (d) {
                        return 'dot i-role-datum ' + color(d[unit.color]);
                    })
                    .attr('cx', function (d) {
                        return options.xScale(d[unit.x]);
                    })
                    .attr('cy', function (d) {
                        return options.yScale(d[unit.y]);
                    });
            };

            var elements = options.container.selectAll('.dot').data(filteredData);
            elements.call(update);
            elements.enter().append('circle').call(update);
            elements.exit().remove();
        },

        'ELEMENT/INTERVAL': function (unit, filteredData, srcData) {
            var options = unit.options || {};

            var update = function () {
                return this
                    .attr('class', 'i-role-datum  bar')
                    .attr('x', function (d) {
                        return options.xScale(d[unit.x]);
                    })
                    .attr('width', options.xScale.rangeBand())
                    .attr('y', function (d) {
                        return options.yScale(d[unit.y]);
                    })
                    .attr('height', function (d) {
                        return options.height - options.yScale(d[unit.y]);
                    });
            };


            var elements = options.container.selectAll(".bar").data(filteredData);
            elements.call(update);
            elements.enter().append('rect').call(update);
            elements.exit().remove();
        },

        'ELEMENT/LINE': function (unit, filteredData, srcData) {
            var options = unit.options || {};

            var updatePaths = function () {
                this.attr('d', line);
            };

            var updateLines = function () {

                var paths = this.selectAll('path').data(function (d) {
                    return [d.values];
                });

                paths.call(updatePaths);
                paths.enter().append('path').call(updatePaths);
                paths.exit().remove();
            };

            var line = d3
                .svg
                .line()
                .x(function (d) {
                    return options.xScale(d[unit.x]);
                })
                .y(function (d) {
                    return options.yScale(d[unit.y]);
                });

            var lines = this.container
                .append('g')
                .attr("class", "line")
                .attr('stroke', '#4daf4a')
                .append("path")
                .datum(filteredData)
                .attr("d", line);

            /*.selectAll('.line').data(data);
             lines.call(updateLines);
             lines.enter().append('g').call(updateLines);
             lines.exit().remove();*/
        }
    };

    return function (unitType) {

        if (!TNodeMap.hasOwnProperty(unitType)) {
            throw new Error('Unknown unit type: ' + unitType);
        }

        return TNodeMap[unitType];
    };

})();