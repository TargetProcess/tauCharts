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

        _onScalesDomainsLayoutsConfigured: function(config) {
            var mapper = this._mapper;
            var maxValue = 0;

            d3.nest()
                .key(mapper.raw('x'))
                .rollup(function(leaves) {
                    var sum = d3.sum(leaves, mapper.raw('y'));
                    if (sum > maxValue) {
                        maxValue = sum;
                    }
                }).entries(config.data);

            //REMAP MAX VALUE OF DOMAIN
            config.y._scale.domain([0, maxValue]);
        },

        _renderData: function (container, data) {

            var mapper = this._mapper;

            var xValues = d3.nest()
                .key(mapper.raw('x'))
                .entries(data);

            var barWidth = 10;

            var looksGoodBarWidth = Math.round(container.layout('width') / (xValues.length || 1));

            if (looksGoodBarWidth < 1) {
                looksGoodBarWidth = 1;
            }

            if (barWidth > looksGoodBarWidth) {
                barWidth = looksGoodBarWidth;
            }

            var categories = d3.nest()
                .key(mapper.raw('color'))
                .entries(data);

            var stackData = categories.map(function(category) {
                return category.values.map(function(d) {
                    return { x: mapper.raw('x')(d), y: mapper.raw('y')(d), color: category.key }
                });
            });

            var arrays = d3.layout.stack()(stackData);

            var stack = d3.merge(arrays);

            var getScale = function(name) {
                  return mapper.binder(name)._scale;
            };

            var update = function () {

                return this.attr('class', function(d) { return 'bar i-role-datum ' + getScale('color')(d.color)})
                    .attr("x", function (d) {
                        return getScale('x')(d.x) - barWidth/2;
                    })
                    .attr("y", function (d) {
                        var scale = getScale('y');
                        return scale(d.y + d.y0);
                    })
                    .attr("width", barWidth)
                    .attr("height", function (d) {
                        var scale = getScale('y');
                        return container.layout('height') - scale(d.y);
                    });
            };

            var elements = container.selectAll('.bar').data(stack);
            elements.call(update);
            elements.enter().append('rect').call(update);
            elements.exit().remove();
        }
    });

    tau.charts.add('Bar', function (data) {
        return new BarChart(data);
    });

})();