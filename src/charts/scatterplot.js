(function() {

    /**@class */
    /**@extends BasicChart */
    var ScatterPlotChart = tau.charts.Base.extend({

        _renderData: function (container, data) {
            this._mapper.binder('size').domain(d3.extent(data, this._mapper.raw('size'))); // TODO: should be done automatically using chart metadata

            var mapper = this._mapper;

            var update = function () {
                return this
                    .attr('class', mapper.map('dot i-role-datum %color%'))
                    .attr('r', mapper.map('size'))
                    .attr('cx', mapper.map('x'))
                    .attr('cy', mapper.map('y'));
            };

            var elements = container.selectAll('.dot').data(data);

            elements.call(update);
            elements.enter().append('circle').call(update);
            elements.exit().remove();
        }
    });

    tau.charts.add('Scatterplot', function (data) {
        return new ScatterPlotChart(data);
    });

})();