(function() {

    /**@class */
    /**@extends BasicChart */
    var ScatterPlotChart = tau.charts.Base.extend({
        _meta: {
            x: {type: tau.data.types.quantitative},
            y: {type: tau.data.types.quantitative},
            color: {type: tau.data.types.categorical, default: 1},
            size: {type: tau.data.types.quantitative, default: 10}
        },

        _renderData: function (container, data) {
            this._mapper.binder('size').range([0, container.layout('width')/100]);
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