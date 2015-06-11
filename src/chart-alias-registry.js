import {default as d3} from 'd3';
import {utils} from './utils/utils';
import {DataProcessor} from './data-processor';

var chartTypes = {};
var chartRules = {};

var throwNotSupported = (alias) => {
    let msg = `Chart type ${alias} is not supported.`;
    console.log(msg);
    console.log(`Use one of ${_.keys(chartTypes).join(', ')}.`);
    throw new Error(msg);
};

var chartTypesRegistry = {

    validate (alias, config) {

        if (!chartRules.hasOwnProperty(alias)) {
            throwNotSupported(alias);
        }

        return chartRules[alias].reduce((e, rule) => e.concat(rule(config) || []), []);
    },

    get (alias) {

        var chartFactory = chartTypes[alias];

        if (!_.isFunction(chartFactory)) {
            throwNotSupported(alias);
        }

        return chartFactory;
    },

    add (alias, converter, rules = []) {
        chartTypes[alias] = converter;
        chartRules[alias] = rules;
        return this;
    },
    getAllRegisteredTypes: function () {
        return chartTypes;
    }
};

export {chartTypesRegistry};
