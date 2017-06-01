import {normalizeConfig, transformConfig} from './converter-helpers';
import {ChartConfig} from '../definitions';

var disableColorToBarPositionOnceColorAndAxesUseTheSameDim = ((normConfig) => {

    var baseScale = (normConfig.flip ? normConfig.y : normConfig.x);
    var isMatch = (baseScale.indexOf(normConfig.color) >= 0);
    var barGuide = normConfig.guide[normConfig.guide.length - 1];
    if (isMatch && !barGuide.hasOwnProperty('enableColorToBarPosition')) {
        barGuide.enableColorToBarPosition = false;
    }

    return normConfig;
});

const ChartInterval = (rawConfig: ChartConfig) => {
    var config = normalizeConfig(rawConfig);

    config = disableColorToBarPositionOnceColorAndAxesUseTheSameDim(config);

    return transformConfig('ELEMENT.INTERVAL', config);
};

export {ChartInterval};