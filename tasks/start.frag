(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore'],function(_){return factory(_, d3);});
    } else if (typeof module === "object" && module.exports) {
        var _ = require('underscore');
        var d3 = require('d3');
        module.exports = factory(_);
    } else {
        root.tauChart = factory(root._, root.d3);
    }
}(this, function (_, d3) {