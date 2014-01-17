(function () {
    /** @class Legend
     * @extends Plugin */
    var Legend = {
        /**
         * @param {RenderContext} context
         * @param {ChartTools} tools
         */
        render: function (context, tools) {
            // TODO: bad that we have width and mapper in tools interface
            var width = tools.width;
            var domain = tools.mapper.domain("color");

            var legend = tools.d3.selectAll(".legend")
                .data(domain)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function (d, i) {
                    return "translate(0," + i * 20 + ")";
                });

            legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", tools.mapper.map("color"));

            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(tools.mapper.format("color"));
        }
    };

    tau.plugins.add('legend', Legend);
})();