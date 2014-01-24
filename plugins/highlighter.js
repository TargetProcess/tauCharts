(function () {
    /** @class Tooltip
     * @extends Plugin */
    var Highlighter = {

        
        /**
         * @param {HoverContext} context
         * @param {ChartElementTools} tools
         */
        mouseover: function (context, tools) { 
            tools._elementContext.classed('highlighted', function (d) {
                return d === context.datum
            })
        },

        /**
         * @param {HoverContext} context
         * @param {ChartElementTools} tools
         */
        mouseout: function (context, tools) {
            tools._elementContext.classed('highlighted', false)
        }
    };

    tau.plugins.add('highlighter', Highlighter);
})();