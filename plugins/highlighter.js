(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(['tauCharts'],function(tauPlugins){return factory(tauPlugins);});
    } else if (typeof module === "object" && module.exports) {
        var tauPlugins = require('tauCharts');
        module.exports = factory();
    } else {
        factory(this.tauCharts);
    }
})(function (tauCharts) {
    /** @class Tooltip
     * @extends Plugin */
    var highlighter = {
        onElementMouseOver: function (chart, data) {
            data.element.classList.toggle('highlighted', true);
        },
        onElementMouseOut: function (chart, data) {
            data.element.classList.toggle('highlighted', false);
        }
    };
    tauCharts.api.plugins.add('highlighter', function() {
       return highlighter;
    });
});