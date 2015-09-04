import {DataProcessor} from '../data-processor';
import {normalizeConfig, transformConfig} from './converter-helpers';

var ChartArea = (rawConfig) => {

    var config = normalizeConfig(rawConfig);

    var data = config.data;

    var log = config.settings.log;

    var orientStrategies = {

        horizontal: (config) => {
            return {
                prop: config.x[config.x.length - 1],
                flip: false
            };
        },

        vertical: (config) => {
            return {
                prop: config.y[config.y.length - 1],
                flip: true
            };
        },

        auto: (config) => {
            var xs = config.x;
            var ys = config.y;
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
            var flip = null;
            if (isMatchAny) {
                propSortBy = variations[variantIndex][0][0];
                flip = (variantIndex !== 0);
            } else {
                log('All attempts are failed. Gonna transform AREA to general PATH.');
                propSortBy = null;
            }

            return {
                prop: propSortBy,
                flip: flip
            };
        }
    };

    var orient = ((typeof config.flip) !== 'boolean') ?
        ('auto') :
        ((config.flip) ? 'vertical' : 'horizontal');

    var strategy = orientStrategies[orient];

    var propSortBy = strategy(config);
    var elementName = 'ELEMENT.AREA';
    if (propSortBy.prop !== null) {
        config.data = _(data).sortBy(propSortBy.prop);
        config.flip = propSortBy.flip;
    } else {
        elementName = 'ELEMENT.PATH';
    }

    return transformConfig(elementName, config);
};

export {ChartArea};