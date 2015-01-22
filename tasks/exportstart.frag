(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['tauCharts'],function(tauCharts){
             return factory(tauCharts);
           });
    } else if (typeof module === "object" && module.exports) {
        var tauChart = require('tauCharts');
        module.exports = factory(tauCharts);
    } else {
        factory(root.tauCharts);
    }
}(this, function (tauCharts) {
