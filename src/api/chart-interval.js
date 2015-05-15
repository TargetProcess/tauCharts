import {normalizeConfig, transformConfig} from './converter-helpers';

var ChartInterval = (rawConfig) => {
    var config = normalizeConfig(rawConfig);
    return transformConfig('ELEMENT.INTERVAL', config);
};

export {ChartInterval};