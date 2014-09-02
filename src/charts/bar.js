(function () {
    /**@class */
    /**@extends BasicChart */
    var BarChart = tau.charts.Base.extend({
        _meta: {
            x: {type: tau.data.types.quantitative},
            y: {type: tau.data.types.quantitative},
            color: {type: tau.data.types.categorical, default: 1}
        },

        map: function (config) {

            this._super(config);
            this._mapper.alias('color', 'key');

            return this;
        },

        _renderData: function (container, data) {

            var mapper = this._mapper;

            var categories = d3.nest()
                .key(mapper.raw('color'))
                .entries(data);

            var xValues = d3.nest()
                .key(mapper.raw('x'))
                .entries(data);

            var barWidth = Math.round(container.layout('width') / (categories.length || 1) / (xValues.length || 1)) - 1;

            if (barWidth < 1) {
                barWidth = 1;
            }

            var update = function () {
                return this.attr('class', mapper.map('bar i-role-datum %color%'))
                    .attr("x", function (d) {
                        return mapper.map('x')(d);
                    })
                    .attr("y", function (d) {
                        return mapper.map('y')(d);
                    })
                    .attr("width", barWidth)
                    .attr("height", function (d) {
                        return container.layout('height') - mapper.map('y')(d);
                    })
                    .attr('fill', mapper.map('color'));
            };

            var elements = container.selectAll('.bar').data(data);
            elements.call(update);
            elements.enter().append('rect').call(update);
            elements.exit().remove();
        }
    });

    tau.charts.add('Bar', function (data) {
        return new BarChart(data);
    });

})();