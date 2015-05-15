import {normalizeConfig, transformConfig} from './converter-helpers';

var ChartScatterplot = (rawConfig) => {
    var config = normalizeConfig(rawConfig);
    return transformConfig('ELEMENT.POINT', config);
};

export {ChartScatterplot};