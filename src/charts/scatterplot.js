(function () {
    var scatterPlotMeta = {
        x: {type: tau.data.types.quantitative},
        y: {type: tau.data.types.quantitative},
        color: {type: tau.data.types.categorical, default: 1},
        size: {type: tau.data.types.quantitative, default: 10}
    };

    /** @class */
    /** @extends Graphics */
    var ScatterPlotGraphics = tau.charts.Graphics.extend({
        render: function (container, data, mapper) {
            mapper.binder('size').range([0, container.layout('width') / 100]);

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

    tau.charts.addGraphics('Scatterplot', new ScatterPlotGraphics(), scatterPlotMeta);
})();