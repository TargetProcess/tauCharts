(function () {
    /** @class Tooltip
     * @extends Plugin */
    var Projection = {

        init: function () {      

        },
        /**
         * @param {HoverContext} context
         * @param {ChartElementTools} tools
         */
        mouseover: function (context, tools) { 
            /*tools._elementContext.classed('projection', function (d) {
                return d === context.datum; 
            })*/
        },

        /**
         * @param {HoverContext} context
         * @param {ChartElementTools} tools
         */
        mouseout: function (context, tools) {
            /*tools._elementContext.classed('projection', false)*/
        }
    };

    tau.plugins.add('projection', Projection);
})();