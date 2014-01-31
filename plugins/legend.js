(function () {
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

            var legend = tools.d3.selectAll(".legend")
                .data(domain)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function (d, i) {
                    return "translate(" + (tools.d3.layout('width')) + "," + i * 20 + ")";
                });

            legend.append("rect")
                // TODO: copy pasted from scatterplot for now, think on it better
                .attr("class", function(d){
                    return "dot " + tools.mapper.map("color")(d); // TODO: think on more elegant syntax like in next lines
                }.bind(this))
                .attr("width", 18)
                .attr("height", 18);

            legend.append("text")
                .attr("dx", -10)
                .attr("dy", 12)
                .style("text-anchor", "end")
                .text(tools.mapper.format("color"));
        }
    };

    tau.plugins.add('legend', Legend);
})();