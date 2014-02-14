(function () {
    /** @class Projection
     * @extends Plugin */
    /* Usage
    .plugins(tau.plugins.projection('x', 'y'))
    */
    var Projection = {

        init: function () {
            if (arguments.length === 0){
                this._axises = ["x", "y"];
            } else {
                this._axises = Array.prototype.slice.call(arguments, 0);
            };
        },

        render: function(context, tools){
            var marginLeft = 20;
            var marginBottom = 30;
            var padding = 10;

            //TODO: remove magic numbers
            var width = tools.d3.layout("width");
            var height = tools.d3.layout("height");
            var mapper = tools.mapper;

            var axises = this._axises;

            this.mouseover = function(context){

                var projections = tools.d3.selectAll(".projections")
                    .data([context.datum])
                    .enter().append("g")
                    .attr("transform", "translate(" + marginLeft + ", 0)")
                    .attr("class", mapper.map("color"))
                    .classed("projections", true);
  
                if (axises.indexOf("x") > -1){

                    projections
                        .append("g")
                            .attr("class", "y")
                        .append("line")
                            .attr("x1", mapper.map("x"))
                            .attr("y1", height - marginBottom + padding)
                            .attr("x2", mapper.map("x"))
                            .attr("y2", mapper.map("y"))

                    projections.select(".y")
                        .append("text")
                            .attr("transform", "translate(0, 18)")
                            //TODO: think how to replace constants with some provided values
                            .attr("dx", mapper.map("x"))
                            .attr("dy", height - marginBottom + 10)
                            .text(mapper.raw("y"));
                };

                if (axises.indexOf("y") > -1){

                    projections.append("g")
                        .attr("class", "x")
                        .append("line")
                            .attr("x1", 0)
                            .attr("y1", mapper.map("y"))
                            .attr("x2", mapper.map("x"))
                            .attr("y2", mapper.map("y"));

                    projections.select(".x")
                        .append("text")
                            .attr("transform", "translate(-19, 4)")
                            //TODO: think how to replace constants with some provided values
                            .attr("dx", 0)
                            .attr("dy", mapper.map("y"))
                            .text(mapper.raw("x"));
                };

            }

            this.mouseout = function(context){
                tools.d3.selectAll(".projections").remove();
            }
        }
    };

    tau.plugins.add('projection', Projection);
})();
