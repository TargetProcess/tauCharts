import {default as d3} from 'd3';
import {utils} from './utils/utils';
import {DataProcessor} from './data-processor';

var chartTypes = {};

var ChartTypesRegistry = {

    get (alias) {
        var chartFactory = chartTypes[alias];

        if (!_.isFunction(chartFactory)) {
            let msg = `Chart type ${alias} is not supported.`;
            console.log(msg);
            console.log(`Use one of ${_.keys(chartTypes).join(', ')}.`);
            throw new Error(msg);
        }

        return chartFactory;
    },

    add (alias, converter) {
        chartTypes[alias] = converter;
        return this;
    }
};

export {ChartTypesRegistry};