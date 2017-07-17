import {TauChartError as Error, errorCodes} from './error';
import {ChartConfig} from './definitions';

type ConfigConverter = (config: ChartConfig) => ChartConfig;
type ConfigRule = (config: ChartConfig) => string | string[];

var chartTypes: {[alias: string]: ConfigConverter} = {};
var chartRules: {[alias: string]: ConfigRule[]} = {};

var throwNotSupported = (alias: string) => {
    let msg = `Chart type ${alias} is not supported.`;
    console.log(msg); // tslint:disable-line
    console.log(`Use one of ${Object.keys(chartTypes).join(', ')}.`); // tslint:disable-line
    throw new Error(msg, errorCodes.NOT_SUPPORTED_TYPE_CHART);
};

type Config = Object;

var chartTypesRegistry = {

    validate(alias: string, config: Config) {

        if (!chartRules.hasOwnProperty(alias)) {
            throwNotSupported(alias);
        }

        return chartRules[alias].reduce((e, rule) => e.concat(rule(config) || []), []);
    },

    get(alias: string) {

        var chartFactory = chartTypes[alias];

        if (typeof chartFactory !== 'function') {
            throwNotSupported(alias);
        }

        return chartFactory;
    },

    add(alias: string, converter: ConfigConverter, rules: ConfigRule[] = []) {
        chartTypes[alias] = converter;
        chartRules[alias] = rules;
        return chartTypesRegistry;
    },

    getAllRegisteredTypes() {
        return chartTypes;
    }
};

export {chartTypesRegistry};
