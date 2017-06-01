var ScalesMap = {};
var ConfigMap = {};
export interface ScaleConstructor {create(scaleType: string, dataFrame: any, scaleConfig: any): any;}

export class scalesRegistry {

    static reg(scaleType: string, scaleClass, configInterceptor) {
        ScalesMap[scaleType] = scaleClass;
        ConfigMap[scaleType] = configInterceptor;
        return this;
    }

    static get(scaleType: string) {
        return ScalesMap[scaleType];
    }

    static instance(settings: any = {}) {
        return {
            create: function (scaleType: string, dataFrame, scaleConfig) {
                var ScaleClass = scalesRegistry.get(scaleType);
                var configFunc = ConfigMap[scaleType];
                return new ScaleClass(dataFrame, configFunc(scaleConfig, settings));
            }
        };
    }
}