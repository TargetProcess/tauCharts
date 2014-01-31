(function () {
    /** @class Tooltip
     * @extends Plugin */
    var Highlighter = {
        /**
         * @param {HoverContext} context
         * @param {ChartElementTools} tools
         */
        mouseover: function (context, tools) { 
            tools.element.classed('highlighted', true);
        },

        /**
         * @param {HoverContext} context
         * @param {ChartElementTools} tools
         */
        mouseout: function (context, tools) {
            tools.element.classed('highlighted', false)
        }
    };

    tau.plugins.add('highlighter', Highlighter);
})();