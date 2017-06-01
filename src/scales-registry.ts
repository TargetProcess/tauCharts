import {DataFrameObject, ScaleConfig, ScaleFunction, ScaleSettings} from './definitions';
import {BaseScale} from './scales/base';

var ScalesMap: {[scale: string]: BaseScaleConstructor} = {};
var ConfigMap: {[scale: string]: ConfigInterceptor} = {};

export class scalesRegistry {

    static reg(scaleType: string, scaleClass: BaseScaleConstructor, configInterceptor: ConfigInterceptor = (x => x)) {
        ScalesMap[scaleType] = scaleClass;
        ConfigMap[scaleType] = configInterceptor;
        return scalesRegistry;
    }

    static get(scaleType: string) {
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

type ConfigInterceptor = (config: ScaleConfig, settings: ScaleSettings) => ScaleConfig;
interface BaseScaleConstructor {new (dataFrame: DataFrameObject, config: ScaleConfig): BaseScale;}
export interface ScaleConstructor {create(scaleType: string, dataFrame: DataFrameObject, scaleConfig: ScaleConfig): BaseScale;}
