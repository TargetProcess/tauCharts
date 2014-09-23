// jshint ignore: start
(function(definition){
    var tau = definition();
    if (typeof define === "function" && define.amd) {
        define(["tauCharts"], tau);
    } else if (typeof module === "object" && module.exports) {
        module.exports = tau;
    } else {
        this.tauChart = tau;
    }
})
(function () {
    'use strict';
