(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(['tauPlugins'],function(tauPlugins){return factory(tauPlugins);});
    } else if (typeof module === "object" && module.exports) {
        var tauPlugins = require('tauPlugins');
        module.exports = factory();
    } else {
        factory(this.tauPlugins);
    }
})(function (tauPlugins) {
    /** @class Tooltip
     * @extends Plugin */
    var highlighter = {
        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        onElementMouseOver: function (chart, data) {
            data.element.classed('highlighted', true);
        },

        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        onElementMouseOut: function (chart, data) {
            data.element.classed('highlighted', false);
        }
    };

    tauPlugins.add('highlighter', function() {
       return highlighter;
    });
});