import {
    DataFrame,
    ScaleConfig,
    ScaleObject,
    ScaleSettings
} from './definitions';

type ConfigInterceptor = (config: ScaleConfig, settings: ScaleSettings) => ScaleConfig;

interface ScaleConstructor {
    new (dataFrame: DataFrame, config: ScaleConfig): ScaleObject;
}

var ScalesMap: {[scale: string]: ScaleConstructor} = {};
var ConfigMap: {[scale: string]: ConfigInterceptor} = {};

export const scalesRegistry = {

    reg(scaleType: string, scaleClass: ScaleConstructor, configInterceptor: ConfigInterceptor = (x => x)) {
        ScalesMap[scaleType] = scaleClass;
        ConfigMap[scaleType] = configInterceptor;
        return scalesRegistry;
    },

    get(scaleType: string) {
        return ScalesMap[scaleType];
    },

    instance(settings: ScaleSettings = {}) {
        return {
            create: function (scaleType: string, dataFrame: DataFrame, scaleConfig: ScaleConfig) {
                var ScaleClass = scalesRegistry.get(scaleType);
                var configFunc = ConfigMap[scaleType];
                return new ScaleClass(dataFrame, configFunc(scaleConfig, settings));
            }
        };
    }
}