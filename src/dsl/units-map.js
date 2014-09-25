var UNITS_MAP = {

    'COORDS/RECT': function (unit, unitIterator) {
        var options = unit.options || {};
        var axes = unit.axes;
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

        if (x.scaleDim) {
            var xScale = d3
                .scale[x.scaleType]()
                .domain(getDomain(TEST_DATA, x.scaleDim, x.scaleType))[getRangeMethod(x.scaleType)]([0, W], 0.1);
            var xAxis = d3.svg.axis().scale(xScale).orient(x.scaleOrient);
            this.container
                .append('g')
                .attr('class', 'x axis')
                .attr('transform', translate(0, H + 6))
                .call(xAxis);
        }

        if (y.scaleDim) {
            var yScale = d3
                .scale[y.scaleType]()
                .domain(getDomain(TEST_DATA, y.scaleDim, y.scaleType))[getRangeMethod(y.scaleType)]([H, 0], 0.1);
            var yAxis = d3.svg.axis().scale(yScale).orient(y.scaleOrient);
            this.container
                .append('g')
                .attr('class', 'y axis')
                .attr('transform', translate(-6, 0))
                .call(yAxis).selectAll('.tick text').attr('transform', 'rotate(' + (y.rotate || 0) + ')');
        }
        if (unit.showGrid && y.scaleDim && x.scaleDim) {
            var xGridAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom')
                .tickSize(H);

            var yGridAxis = d3.svg.axis()
                .scale(yScale)
                .orient('left')
                .tickSize(-W);
            var grid = this.container.insert('g', ':first-child').attr('class', 'grids');

            grid.append('g').call(xGridAxis);
            grid.append('g').call(yGridAxis);

            // TODO: make own axes and grid instead of using d3's in such tricky way
            grid.selectAll('text').remove();
        }

        var grid = this.container
            .append('g')
            .attr('class', 'grid')
            .attr('transform', translate(0, 0));


        var unitFilter = (unit.filter || _.identity);

        var unitOperation = (unit.func || function () {
            return [
                [
                    function (rec) {
                        return unitFilter(rec);
                    }
                ]
            ];
        });

        var matrix2DPredicates = unitOperation(x.scaleDim, y.scaleDim);

        var nR = matrix2DPredicates.length;
        _.each(matrix2DPredicates, function (rowOfPredicates, iRow) {

            var nC = rowOfPredicates.length;
            var cellW = W / nC;
            var cellH = H / nR;

            _.each(rowOfPredicates, function (predicateRC, iCol) {

                unit.unit.forEach(function (node) {
                    node.filter = predicateRC;
                    unitIterator(
                        node,
                        {
                            container: grid,
                            width: cellW,
                            height: cellH,
                            top: iRow * cellH,
                            left: iCol * cellW,
                            xScale: xScale,
                            yScale: yScale
                        });
                });
            })
        });
    },

    'ELEMENT/POINT': function (unit) {
        var options = unit.options || {};

        var update = function () {
            return this
                .attr('r', 3)
                .attr('cx', function (d) {
                    return options.xScale(d[unit.x]);
                })
                .attr('cy', function (d) {
                    return options.yScale(d[unit.y]);
                });
        };

        var data = _(TEST_DATA).filter(unit.filter);

        var elements = options.container.selectAll('.dot').data(data);
        elements.call(update);
        elements.enter().append('circle').call(update);
        elements.exit().remove();
    },
    'ELEMENT/INTERVAL': function (unit) {
        var options = unit.options || {};
        var data = _(TEST_DATA).filter(unit.filter);

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


        var elements = options.container.selectAll(".bar").data(data);
        elements.call(update);
        elements.enter().append('rect').call(update);
        elements.exit().remove();
    }
};
