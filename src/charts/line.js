(function() {
    /**@class */
    /**@extends BasicChart */
    var LineChart = tau.charts.Base.extend({
        map: function (config) {
            this._super(config);
            this._mapper.alias('color', 'key');

            return this;
        },
        _renderData: function (container, data) {
            var mapper = this._mapper;

            // prepare data to build several lines
            // TODO: provide several data transformers to support more formats
            // sometime we will have data already nested, for example.
            var categories = d3.nest()
                .key(mapper.raw('color'))
                .entries(data);

            var updateLines = function () {
                this.attr('class', mapper.map('line %color%'));

                var paths = this.selectAll('path').data(function (d) {
                    return [d.values];
                });

                // TODO: extract update pattern to some place
                paths.call(updatePaths);
                paths.enter().append('path').call(updatePaths);
                paths.exit().remove();

                var dots = this.selectAll('.dot').data(function (d) {
                    return d.values;
                });

                dots.call(updateDots);
                dots.enter().append('circle').attr('class', 'dot i-role-datum').call(updateDots);
                dots.exit().remove();
            };

            //TODO: allow to set interpolation outside
            var line = d3.svg.line()
                .interpolate('cardinal')
                .x(mapper.map('x'))
                .y(mapper.map('y'));

            var updatePaths = function () {
                this.attr('d', line);
            };

            var updateDots = function () {
                // draw circles (to enable mouse interactions)
                return this
                    .attr('cx', mapper.map('x'))
                    .attr('cy', mapper.map('y'))
                    .attr('r', function () {
                        return 3;
                    });
            };

            var lines = container.selectAll('.line').data(categories);
            lines.call(updateLines);
            lines.enter().append('g').call(updateLines);
            lines.exit().remove();
        }
    });

    tau.charts.add('Line', function (data) {
        return new LineChart(data);
    });
    
})();