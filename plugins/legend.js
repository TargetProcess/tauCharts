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
                .append('ul')
                .attr('class', 'legend');

            var legend = container
                .selectAll('li')
                .data(domain)
                .enter()
                .append('li');

            legend
                .attr('class', tools.mapper.map("color"))
                .on('click', function (d) {
                    // TODO: quick and dirty filtering, will be removed when data types and legend controls for them are introduced
                    var value = tools.mapper.raw("color")(d);

                    if (disabled.indexOf(value) == -1) {
                        disabled.push(value);
                        d3.select(this).classed('disabled', true);
                    } else {
                        disabled = disabled.filter(not(value));
                        d3.select(this).classed('disabled', false);
                    }

                    context.data.filter(function (d) {
                        return disabled.indexOf(tools.mapper.raw("color")(d)) == -1;
                    });
                })
                .on('mouseover', function (d) {
                    var value = tools.mapper.raw("color")(d);

                    tools.elements().classed('highlighted',
                        function (d) {
                            return tools.mapper.raw('color')(d) === value;
                        })
                })
                .on('mouseout', function () {
                    tools.elements().classed('highlighted', false);
                });

            legend
                .text(tools.mapper.raw('color'));
        }
    };

    tau.plugins.add('legend', Legend);
})();