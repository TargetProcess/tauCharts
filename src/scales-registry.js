var ScalesMap = {};

var scalesRegistry = {

    reg: function (scaleType, scaleClass) {
        ScalesMap[scaleType] = scaleClass;
        return this;
    },

    get: function (scaleType) {
        return ScalesMap[scaleType];
    }
};

export {scalesRegistry};