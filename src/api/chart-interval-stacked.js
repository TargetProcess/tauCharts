import {normalizeConfig, transformConfig} from './converter-helpers';

var ChartIntervalStacked = (rawConfig) => {
    var config = normalizeConfig(rawConfig);
    return transformConfig('ELEMENT.INTERVAL.STACKED', config);
};

export {ChartIntervalStacked};