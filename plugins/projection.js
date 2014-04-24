(function () {
    /** @class Projection
     * @extends Plugin */
    /* Usage
     .plugins(tau.plugins.projection('x', 'y'))
     */
    var Projection = {

        init: function () {
            if (arguments.length === 0) {
                this._axises = ["x", "y"];
            } else {
                this._axises = Array.prototype.slice.call(arguments, 0);
            }
        },

        render: function (context, tools) {
            var marginLeft = 20;
            var marginBottom = 30;
            var padding = 10;

            //TODO: remove magic numbers
            var width = tools.svg.layout("width");
            var height = tools.svg.layout("height");
            var mapper = tools.mapper;

            var axises = this._axises;

            tools.svg.append("defs")
                .html('<filter x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" id="outline">' + 
                            '<feMorphology operator="dilate" in="SourceGraphic" result="Outline" radius="3"/>' +
                            '<feColorMatrix result="Outline" in="Outline" type="matrix" values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.95 0" />' +
                            '<feMerge>' +
                                '<feMergeNode in="Outline"></feMergeNode>' +
                                '<feMergeNode in="SourceGraphic"></feMergeNode>' +
                            '</feMerge>' +
                        '</filter>');

            var parent = tools;

            this.mouseover = function (context, tools) {

                var currentY = +tools.element.attr("cy");
                var currentX = +tools.element.attr("cx");

                var projections = parent.svg.selectAll(".projections")
                    .data([context.datum])
                    .enter().append("g")
                    .attr("transform", "translate(" + marginLeft + ", 0)")
                    .attr("class", mapper.map("color"))
                    .classed("projections", true);

                if (axises.indexOf("x") > -1) {

                    projections
                        .append("g")
                        .attr("class", "y")
                        .append("line")
                        .attr("x1", mapper.map("x"))
                        .attr("y1", height - marginBottom + padding)
                        .attr("x2", currentX)
                        .attr("y2", function(d){
                            return currentY + mapper.map("size")(d);
                        });

                    projections.select(".y")
                        .append("text")
                        .attr("transform", "translate(0, 18)")
                        //TODO: think how to replace constants with some provided values
                        .attr("filter", "url(#outline)")
                        .attr("dx", mapper.map("x"))
                        .attr("dy", height - marginBottom + 10)
                        .text(mapper.raw("x"));
                }

                if (axises.indexOf("y") > -1) {

                    projections.append("g")
                        .attr("class", "x")
                        .append("line")
                        .attr("x1", -padding)
                        .attr("y1", mapper.map("y"))
                        .attr("x2", function(d){
                            return currentX - mapper.map("size")(d);
                        })
                        .attr("y2", currentY);

                    projections.select(".x")
                        .append("text")
                        .attr("transform", "translate(-19, 4)")
                        //TODO: think how to replace constants with some provided values
                        .attr("filter", "url(#outline)")
                        .attr("dx", 0)
                        .attr("dy", mapper.map("y"))
                        .text(mapper.raw("y"));
                }
            };

            this.mouseout = function () {
                tools.svg.selectAll(".projections").remove();
            }
        },
        mouseover: function(context, tools){
        }
    };

    tau.plugins.add('projection', Projection);
})();
