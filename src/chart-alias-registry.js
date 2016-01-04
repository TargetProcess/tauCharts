import {TauChartError as Error, errorCodes} from './error';
import {default as _} from 'underscore';
var chartTypes = {};
var chartRules = {};

var throwNotSupported = (alias) => {
    let msg = `Chart type ${alias} is not supported.`;
    console.log(msg); // eslint-disable-line
    console.log(`Use one of ${_.keys(chartTypes).join(', ')}.`); // eslint-disable-line
    throw new Error(msg, errorCodes.NOT_SUPPORTED_TYPE_CHART);
};

var chartTypesRegistry = {

    validate(alias, config) {

        if (!chartRules.hasOwnProperty(alias)) {
            throwNotSupported(alias);
        }

        return chartRules[alias].reduce((e, rule) => e.concat(rule(config) || []), []);
    },

    get(alias) {

        var chartFactory = chartTypes[alias];

        if (!_.isFunction(chartFactory)) {
            throwNotSupported(alias);
        }

        return chartFactory;
    },

    add(alias, converter, rules = []) {
        chartTypes[alias] = converter;
        chartRules[alias] = rules;
        return this;
    },
    getAllRegisteredTypes: function () {
        return chartTypes;
    }
};

export {chartTypesRegistry};
