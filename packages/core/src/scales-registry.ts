import {
    DataFrameObject,
    ScaleConfig,
    ScaleFunction,
    ScaleSettings,
    ScaleFields,
} from './definitions';
import {BaseScale} from './scales/base';

type ConfigInterceptor = (config: ScaleConfig, settings: ScaleSettings) => ScaleConfig;

interface BaseScaleConstructor {
    new(dataFrame: DataFrameObject, config: ScaleConfig): BaseScale & ScaleFields;
}

export interface ScaleConstructor {
    create(scaleType: string, dataFrame: DataFrameObject, scaleConfig: ScaleConfig): BaseScale & ScaleFields;
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
            create: function (scaleType: string, dataFrame: DataFrameObject, scaleConfig: ScaleConfig) {
                var ScaleClass = scalesRegistry.get(scaleType);
                var configFunc = ConfigMap[scaleType];
                return new ScaleClass(dataFrame, configFunc(scaleConfig, settings));
            }
        };
    }
};
