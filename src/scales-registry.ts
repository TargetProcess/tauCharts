import {
    DataFrame,
    ScaleConfig,
    ScaleFunction,
    ScaleSettings
} from './definitions';
import {BaseScale} from './scales/base';

type ConfigInterceptor = (config: ScaleConfig, settings: ScaleSettings) => ScaleConfig;

interface BaseScaleConstructor {
    new (dataFrame: DataFrame, config: ScaleConfig): BaseScale;
}

var ScalesMap: {[scale: string]: BaseScaleConstructor} = {};
var ConfigMap: {[scale: string]: ConfigInterceptor} = {};

export const scalesRegistry = {

    reg(scaleType: string, scaleClass: BaseScaleConstructor, configInterceptor: ConfigInterceptor = (x => x)) {
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

export interface ScaleConstructor {
    create(scaleType: string, dataFrame: DataFrame, scaleConfig: ScaleConfig): BaseScale;
}
