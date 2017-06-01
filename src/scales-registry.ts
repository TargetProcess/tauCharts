var ScalesMap = {};
var ConfigMap = {};
import {DataFrameObject, ScaleConfig, ScaleSettings} from './definitions'; import {BaseScale} from './scales/base'; export interface ScaleConstructor {create(scaleType: string, dataFrame: DataFrameObject, scaleConfig: ScaleConfig): BaseScale;} type ConfigInterceptor = (config: ScaleConfig, settings: ScaleSettings) => ScaleConfig; interface BaseScaleConstructor {new (dataFrame: DataFrameObject, config: ScaleConfig): BaseScale;}

export class scalesRegistry {

    static reg(scaleType: string, scaleClass: BaseScaleConstructor, configInterceptor: ConfigInterceptor = (x => x)) {
        ScalesMap[scaleType] = scaleClass;
        ConfigMap[scaleType] = configInterceptor;
        return this;
    }

    static get(scaleType: string): BaseScaleConstructor {
        return ScalesMap[scaleType];
    }

    static instance(settings: ScaleSettings = {}) {
        return {
            create: function (scaleType: string, dataFrame: DataFrameObject, scaleConfig: ScaleConfig) {
                var ScaleClass = scalesRegistry.get(scaleType);
                var configFunc = ConfigMap[scaleType];
                return new ScaleClass(dataFrame, configFunc(scaleConfig, settings));
            }
        };
    }
}