import {utils} from '../utils/utils';
import {DataProcessor} from '../data-processor';
import {normalizeConfig, transformConfig} from './converter-helpers';

var ChartLine = (rawConfig, useElement = 'ELEMENT.LINE') => {
    var config = normalizeConfig(rawConfig);

    var data = config.data;

    var log = config.settings.log;

    var lineOrientationStrategies = {

        none: (config) => null,

        horizontal: (config) => {
            var xs = utils.isArray(config.x) ? config.x : [config.x];
            return xs[xs.length - 1];
        },

        vertical: (config) => {
            var ys = utils.isArray(config.y) ? config.y : [config.y];
            return ys[ys.length - 1];
        },

        auto: (config) => {
            var xs = utils.isArray(config.x) ? config.x : [config.x];
            var ys = utils.isArray(config.y) ? config.y : [config.y];
            var primaryX = xs[xs.length - 1];
            var secondaryX = xs.slice(0, xs.length - 1);
            var primaryY = ys[ys.length - 1];
            var secondaryY = ys.slice(0, ys.length - 1);
            var colorProp = config.color;

            var rest = secondaryX.concat(secondaryY).concat([colorProp]).filter((x) => x !== null);

            var variantIndex = -1;
            var variations = [
                [[primaryX].concat(rest), primaryY],
                [[primaryY].concat(rest), primaryX]
            ];
            var isMatchAny = variations.some((item, i) => {
                var domainFields = item[0];
                var rangeProperty = item[1];
                var r = DataProcessor.isYFunctionOfX(data, domainFields, [rangeProperty]);
                if (r.result) {
                    variantIndex = i;
                } else {
                    log([
                        'Attempt to find a functional relation between',
                        item[0] + ' and ' + item[1] + ' is failed.',
                        'There are several ' + r.error.keyY + ' values (e.g. ' + r.error.errY.join(',') + ')',
                        'for (' + r.error.keyX + ' = ' + r.error.valX + ').'
                    ].join(' '));
                }
                return r.result;
            });

            var propSortBy;
            if (isMatchAny) {
                propSortBy = variations[variantIndex][0][0];
            } else {
                log([
                    'All attempts are failed.',
                    'Will orient line horizontally by default.',
                    'NOTE: the [scatterplot] chart is more convenient for that data.'
                ].join(' '));
                propSortBy = primaryX;
            }

            return propSortBy;
        }
    };

    var orient = (config.lineOrientation || 'auto').toLowerCase();
    var strategy = lineOrientationStrategies.hasOwnProperty(orient) ?
        lineOrientationStrategies[orient] :
        lineOrientationStrategies.auto;

    var propSortBy = strategy(config);
    if (propSortBy !== null) {
        config.data = _(data).sortBy(propSortBy);
    }

    return transformConfig(useElement, config);
};

export {ChartLine};