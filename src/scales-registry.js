var ScalesMap = {};

var scalesRegistry = {

    reg: function (scaleType, scaleClass) {
        ScalesMap[scaleType] = scaleClass;
        return this;
    },

    get: function (scaleType) {
        return ScalesMap[scaleType];
    },

    create: (spec, frame, scaleId, scaleSettings) => {
        throw new Error('Not implemented');
    }
};

export {scalesRegistry};