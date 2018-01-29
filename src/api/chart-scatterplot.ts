import {normalizeConfig, transformConfig} from './converter-helpers';
import {ChartConfig} from '../definitions';

const ChartScatterplot = (rawConfig: ChartConfig) => {
    var config = normalizeConfig(rawConfig);
    return transformConfig('ELEMENT.POINT', config);
};

export {ChartScatterplot};
