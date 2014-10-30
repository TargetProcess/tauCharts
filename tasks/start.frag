(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory;
    } else {
        root.tauChart = factory();
    }
}(this, function () {