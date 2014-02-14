(function () {
    function not(x) {
        return function (d) {
            return x != d;
        }
    }

    /** @class Legend
     * @extends Plugin */
    var Legend = {
        /**
         * @param {RenderContext} context
         * @param {ChartTools} tools
         */
        render: function (context, tools) {
            var width = tools.svg.layout('width');

            // TODO: bad that we have mapper in tools interface
            var domain = tools.mapper.domain('color');
            var disabled = [];

            var container = tools.html
                .right
                .append('div')
                .attr('class', 'legend');

            var legend = container
                .selectAll('div')
                .data(domain)
                .enter()
                .append('div');

            legend
                .append('span')
                .html('&nbsp')
                .attr('class', tools.mapper.map("dot %color%"))
                .style('width', '18px')
                .style('height', '18px')
                .style('display', 'inline-block')
                .style('margin', '3px')
                .on('click', function (d) {
                    // TODO: quick and dirty filtering, will be removed when data types and legend controls for them are introduced
                    var value = tools.mapper.map("color")(d);

                    if (disabled.indexOf(value) == -1) {
                        disabled.push(value);
                        d3.select(this).classed('disabled', true);
                    } else {
                        disabled = disabled.filter(not(value));
                        d3.select(this).classed('disabled', false);
                    }

                    context.data.filter(function (d) {
                        return disabled.indexOf(tools.mapper.map("color")(d)) == -1;
                    });
                });

            legend
                .append('span')
                .text(tools.mapper.raw('color'));
        }
    };

    tau.plugins.add('legend', Legend);
})();