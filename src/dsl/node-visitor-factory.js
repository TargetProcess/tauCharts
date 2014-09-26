var TNodeVisitorFactory = (function () {

    var translate = function (left, top) {
        return 'translate(' + left + ',' + top + ')';
    };

    var getRangeMethod = function (scaleType) {
        return ((scaleType === 'ordinal') ? 'rangeRoundBands' : 'rangeRound');
    };

    var TNodeMap = {

        'COORDS/RECT': function (node, srcData, continueTraverse) {
            var options = node.options || {};
            var axes = node.axes;
            var x = _.defaults(axes[0] || {}, {scaleOrient: 'bottom'});
            var y = _.defaults(axes[1] || {}, {scaleOrient: 'left'});
            var PX = 36;
            var PY = 18;

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
                var xAxis = d3.svg.axis().scale(xScale).orient(x.scaleOrient);
                this.container
                    .append('g')
                    .attr('class', 'x axis')
                    .attr('transform', translate(0, H + 6))
                    .call(xAxis);
            }

            var yScale;
            if (y.scaleDim) {
                yScale = node.$scales[y.scaleDim][getRangeMethod(y.scaleType)]([H, 0], 0.1);
                var yAxis = d3.svg.axis().scale(yScale).orient(y.scaleOrient);
                this.container
                    .append('g')
                    .attr('class', 'y axis')
                    .attr('transform', translate(-6, 0))
                    .call(yAxis);
            }

            if (node.showGrid && xScale && yScale) {
                var xGridAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom')
                    .tickSize(H);

                var yGridAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient('left')
                    .tickSize(-W);

                var grids = this.container.insert('g', ':first-child').attr('class', 'grids');

                grids.append('g').call(xGridAxis);
                grids.append('g').call(yGridAxis);

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

        'ELEMENT/POINT': function (unit, data) {

            var options = unit.options || {};

            var color = tau
                .data
                .scale
                .color10()
                .domain(_.uniq(data.map(function (el) {
                    return el[unit.color];
                })));

            var size = d3
                .scale
                .linear()
                .range([0, options.width / 100])
                .domain([
                    0,
                    _.max(data.map(function (el) {
                        return el[unit.size];
                    }))
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
                        return color(d[unit.color]);
                    })
                    .attr('cx', function (d) {
                        return options.xScale(d[unit.x]);
                    })
                    .attr('cy', function (d) {
                        return options.yScale(d[unit.y]);
                    });
            };

            var elements = options.container.selectAll('.dot').data(data);
            elements.call(update);
            elements.enter().append('circle').call(update);
            elements.exit().remove();
        },

        'ELEMENT/INTERVAL': function (unit, srcData) {
            var options = unit.options || {};

            var update = function () {
                return this
                    .attr('class', 'bar')
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


            var elements = options.container.selectAll(".bar").data(srcData);
            elements.call(update);
            elements.enter().append('rect').call(update);
            elements.exit().remove();
        },

        'ELEMENT/LINE': function (unit, data) {
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
                .datum(data)
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