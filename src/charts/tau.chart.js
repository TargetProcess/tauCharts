import {Plot} from './tau.plot';
import {utils} from '../utils/utils';
import {DataProcessor} from '../data-processor';

var convertAxis = (data) => (!data) ? null : data;

var normalizeSettings = (axis) => (!utils.isArray(axis)) ? [axis] : axis;

var createElement = (type, config) => {
    return {
        type: type,
        x: config.x,
        y: config.y,
        color: config.color,
        guide: {
            color: config.colorGuide
        },
        flip: config.flip,
        size: config.size
    };
};

const status = {
    SUCCESS: "SUCCESS",
    WARNING: "WARNING",
    FAIL: "FAIL"
};
/* jshint ignore:start */
var strategyNormalizeAxis = {
    [status.SUCCESS]: (axis) => axis,
    [status.FAIL]: () => {
        throw new Error('This configuration is not supported, See http://api.taucharts.com/basic/facet.html#easy-approach-for-creating-facet-chart');
    },
    [status.WARNING]: (axis, config) => {
        var measure = axis[config.indexMeasureAxis[0]];
        var newAxis = _.without(axis, measure);
        newAxis.push(measure);
        return newAxis;
    }
};
/* jshint ignore:end */
function validateAxis(dimensions, axis) {
    return axis.reduce(function (result, item, index) {
        if (dimensions[item].type === 'measure') {
            result.countMeasureAxis++;
            result.indexMeasureAxis.push(index);
        }
        if (dimensions[item].type !== 'measure' && result.countMeasureAxis === 1) {
            result.status = status.WARNING;
        } else if (result.countMeasureAxis > 1) {
            result.status = status.FAIL;
        }
        return result;
    }, {status: status.SUCCESS, countMeasureAxis: 0, indexMeasureAxis: []});
}
function transformConfig(type, config) {
    var x = normalizeSettings(config.x);
    var y = normalizeSettings(config.y);

    var validatedX = validateAxis(config.dimensions, x);
    var validatedY = validateAxis(config.dimensions, y);
    x = strategyNormalizeAxis[validatedX.status](x, validatedX);
    y = strategyNormalizeAxis[validatedY.status](y, validatedY);
    var guide = normalizeSettings(config.guide);
    var maxDeep = Math.max(x.length, y.length);

    // feel the gaps if needed
    while (guide.length < maxDeep) {
        guide.push({});
    }

    // cut items
    guide = guide.slice(0, maxDeep);

    var spec = {
        type: 'COORDS.RECT',
        unit: []
    };

    for (var i = maxDeep; i > 0; i--) {
        var currentX = x.pop();
        var currentY = y.pop();
        var currentGuide = guide.pop() || {};
        if (i === maxDeep) {
            spec.x = currentX;
            spec.y = currentY;
            spec.unit.push(createElement(type, {
                x: convertAxis(currentX),
                y: convertAxis(currentY),
                color: config.color,
                size: config.size,
                flip: config.flip,
                colorGuide: currentGuide.color
            }));
            spec.guide = _.defaults(
                currentGuide,
                {
                    x: {label: currentX},
                    y: {label: currentY}
                });
        } else {
            spec = {
                type: 'COORDS.RECT',
                x: convertAxis(currentX),
                y: convertAxis(currentY),
                unit: [spec],
                guide: _.defaults(
                    currentGuide,
                    {
                        x: {label: currentX},
                        y: {label: currentY}
                    })
            };
        }
    }

    config.spec = {
        dimensions: config.dimensions,
        unit: spec
    };
    return config;
}

var typesChart = {
    'scatterplot': (config)=> {
        return transformConfig('ELEMENT.POINT', config);
    },
    'line': (config) => {

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

                var rest = secondaryX.concat(secondaryY).concat([colorProp]).filter((x) => x !== null );

                var variantIndex = -1;
                var variations = [
                    [[primaryX].concat(rest), primaryY],
                    [[primaryY].concat(rest), primaryX]
                ];
                var isMatchAny = variations.some((item, i) => {
                    var domainFields  = item[0];
                    var rangeProperty = item[1];
                    var r = DataProcessor.isYFunctionOfX(data, domainFields, [rangeProperty]);
                    if (r.result) {
                        variantIndex = i;
                    }
                    else {
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
                }
                else {
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

        return transformConfig('ELEMENT.LINE', config);
    },
    'bar': (config) => {
        config.flip = false;
        return transformConfig('ELEMENT.INTERVAL', config);
    },
    'horizontalBar': (config) => {
        config.flip = true;
        return transformConfig('ELEMENT.INTERVAL', config);
    }
};

export class Chart extends Plot {
    constructor(config) {
        config.settings   = this.setupSettings(config.settings);
        config.dimensions = this.setupMetaInfo(config.dimensions, config.data);
        super(typesChart[config.type](config));
    }
}