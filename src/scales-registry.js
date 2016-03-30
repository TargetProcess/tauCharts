var ScalesMap = {};
var ConfigMap = {};

export class scalesRegistry {

    static reg (scaleType, scaleClass, configInterceptor = (x => x)) {
        ScalesMap[scaleType] = scaleClass;
        ConfigMap[scaleType] = configInterceptor;
        return this;
    }

    static get (scaleType) {
        return ScalesMap[scaleType];
    }

    static instance (settings = {}) {
        return {
            create: function (scaleType, dataFrame, scaleConfig) {
                var ScaleClass = scalesRegistry.get(scaleType);
                var configFunc = ConfigMap[scaleType];
                return new ScaleClass(dataFrame, configFunc(scaleConfig, settings));
            }
        };
    }
}