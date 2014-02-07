(function () {
    function not(x){
        return function(d){
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
            var width = tools.d3.layout('width');

            // TODO: bad that we have mapper in tools interface
            var domain = tools.mapper.domain("color");
            var disabled = [];

            var legend = tools.d3.selectAll(".legend")
                .data(domain)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function (d, i) {
                    return "translate(" + (tools.d3.layout('width')) + "," + i * 20 + ")";
                });

            legend.append("rect")
                .attr("class",  tools.mapper.map("dot %color%"))
                .attr("width", 18)
                .attr("height", 18)
                .on('click', function(d) {
                    // TODO: quick and dirty filtering, will be removed when data types and legend controls for them are introduced
                    var value = tools.mapper.map("color")(d);

                    if (disabled.indexOf(value) == -1) {
                        disabled.push(value);
                        d3.select(this).classed('disabled', true);
                    } else {
                        disabled = disabled.filter(not(value));
                        d3.select(this).classed('disabled', false);
                    }

                    context.data.filter(function(d){
                        return disabled.indexOf(tools.mapper.map("color")(d)) == -1;
                    });
                });

            legend.append("text")
                .attr("dx", -10)
                .attr("dy", 12)
                .style("text-anchor", "end")
                .text(tools.mapper.raw("color"));
        }
    };

    tau.plugins.add('legend', Legend);
})();