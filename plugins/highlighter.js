(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(['tauPlugins'],function(tauPlugins){return factory(tauPlugins);});
    } else if (typeof module === "object" && module.exports) {
        var tauPlugins = require('tauPlugins');
        module.exports = factory();
    } else {
        factory(this.tauPlugins)
    }
})(function (tauPlugins) {
    /** @class Tooltip
     * @extends Plugin */
    var Highlighter = {
        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        mouseover: function (context, tools) { 
            tools.element.classed('highlighted', true);
        },

        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        mouseout: function (context, tools) {
            tools.element.classed('highlighted', false);
        }
    };

    tauPlugins.add('highlighter', Highlighter);
});