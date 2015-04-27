import {Plot} from './tau.plot';
import {utils} from '../utils/utils';
import {DataProcessor} from '../data-processor';

var convertAxis = (data) => (!data) ? null : data;

var normalizeSettings = (axis, defaultValue = null) => {
    return (!utils.isArray(axis)) ?
        [axis] :
        (axis.length === 0) ? [defaultValue] : axis;
};

var createElement = (type, config) => {
    return {
        type: type,
        x: config.x,
        y: config.y,
        color: config.color,
        guide: {
            color: config.colorGuide,
            size: config.sizeGuide
        },
        flip: config.flip,
        size: config.size
    };
};

const status = {
    SUCCESS: 'SUCCESS',
    WARNING: 'WARNING',
    FAIL: 'FAIL'
};
/* jshint ignore:start */

var strategyNormalizeAxis = {
    [status.SUCCESS]: (axis) => axis,
    [status.FAIL]: (axis, data) => {
        throw new Error((data.messages || []).join('\n') ||
        // jscs:disable
        'This configuration is not supported, See http://api.taucharts.com/basic/facet.html#easy-approach-for-creating-facet-chart');
    },
    [status.WARNING]: (axis, config, guide) => {
        var axisName = config.axis;
        var index = config.indexMeasureAxis[0];
        var measure = axis[index];
        var newAxis = _.without(axis, measure);
        newAxis.push(measure);

        var measureGuide = guide[index][axisName] || {};
        var categoryGuide = guide[guide.length - 1][axisName] || {};

        guide[guide.length - 1][axisName] = measureGuide;
        guide[index][axisName] = categoryGuide;

        return newAxis;
    }
};
/* jshint ignore:end */
function validateAxis(dimensions, axis, axisName) {
    return axis.reduce(function (result, item, index) {
        var dimension = dimensions[item];
        if (!dimension) {
            result.status = status.FAIL;
            if(item) {
                result.messages.push(`"${item}" dimension is undefined for "${axisName}" axis`);
            } else {
                result.messages.push(`"${axisName}" axis should be specified`);
            }

        } else if (result.status != status.FAIL) {
            if (dimension.type === 'measure') {
                result.countMeasureAxis++;
                result.indexMeasureAxis.push(index);
            }
            if (dimension.type !== 'measure' && result.countMeasureAxis === 1) {
                result.status = status.WARNING;
            } else if (result.countMeasureAxis > 1) {
                result.status = status.FAIL;
                result.messages.push(`There is more than one measure dimension for "${axisName}" axis`);
            }
        }
        return result;
    }, {status: status.SUCCESS, countMeasureAxis: 0, indexMeasureAxis: [], messages: [], axis: axisName});
}

function normalizeConfig(config) {

    var x = normalizeSettings(config.x);
    var y = normalizeSettings(config.y);

    var maxDeep = Math.max(x.length, y.length);

    var guide = normalizeSettings(config.guide, {});

    // feel the gaps if needed
    _.times((maxDeep - guide.length), () => guide.push({}));

    // cut items
    guide = guide.slice(0, maxDeep);

    var validatedX = validateAxis(config.dimensions, x, 'x');
    var validatedY = validateAxis(config.dimensions, y, 'y');
    x = strategyNormalizeAxis[validatedX.status](x, validatedX, guide);
    y = strategyNormalizeAxis[validatedY.status](y, validatedY, guide);

    return _.extend(
        {},
        config,
        {
            x: x,
            y: y,
            guide: guide
        });
}

function transformConfig(type, config) {

    var x = config.x;
    var y = config.y;
    var guide = config.guide;
    var maxDepth = Math.max(x.length, y.length);

    var spec = {
        type: 'COORDS.RECT',
        unit: []
    };

    var xs = [].concat(x);
    var ys = [].concat(y);
    var gs = [].concat(guide);

    for (var i = maxDepth; i > 0; i--) {
        var currentX = xs.pop();
        var currentY = ys.pop();
        var currentGuide = gs.pop() || {};
        if (i === maxDepth) {
            spec.x = currentX;
            spec.y = currentY;
            spec.unit.push(createElement(type, {
                x: convertAxis(currentX),
                y: convertAxis(currentY),
                color: config.color,
                size: config.size,
                flip: config.flip,
                colorGuide: currentGuide.color,
                sizeGuide: currentGuide.size
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
    'scatterplot': (rawConfig) => {
        var config = normalizeConfig(rawConfig);
        return transformConfig('ELEMENT.POINT', config);
    },
    'line': (rawConfig) => {

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
    'bar': (rawConfig) => {
        var config = normalizeConfig(rawConfig);
        config.flip = false;
        return transformConfig('ELEMENT.INTERVAL', config);
    },
    'horizontalBar': (rawConfig) => {
        var config = normalizeConfig(rawConfig);
        config.flip = true;
        return transformConfig('ELEMENT.INTERVAL', config);
    },

    'map': (config) => {

        var shouldSpecifyFillWithCode = (config.fill && config.code);
        if (config.fill && !shouldSpecifyFillWithCode) {
            throw new Error('[code] must be specified when using [fill]');
        }

        var shouldSpecifyBothLatLong = (config.latitude && config.longitude);
        if ((config.latitude || config.longitude) && !shouldSpecifyBothLatLong) {
            throw new Error('[latitude] and [longitude] both must be specified');
        }

        var shouldSpecifyData = (config.data);
        if (!shouldSpecifyData) {
            throw new Error('[data] must be specified');
        }

        var guide = _.extend(
            {
                sourcemap: [
                    'https://gist.githubusercontent.com/d3noob/5189184',
                    'raw/598d1ebe0c251cd506c8395c60ab1d08520922a7',
                    'world-110m2.json'
                ].join('/'),
                contour: 'countries'
            },
            config.guide || {});

        guide.size = _.extend(guide.size || {}, {min: 1, max: 10});

        var scales = {};

        var scalesPool = (type, prop, guide = {}) => {
            var key;
            var dim = prop;
            var src;
            if (!prop) {
                key = `${type}:default`;
                src = '?';
            } else {
                key = `${type}_${prop}`;
                src = '/';
            }

            if (!scales.hasOwnProperty(key)) {
                scales[key] = _.extend(
                    {type: type, source: src, dim: dim},
                    guide
                );
            }

            return key;
        };

        return {
            sources: {
                '?': {
                    dims: {},
                    data: [{}]
                },
                '/': {
                    dims: Object
                        .keys(config.dimensions)
                        .reduce((dims, k) => {
                            dims[k] = {type: config.dimensions[k].type};
                            return dims;
                        }, {}),
                    data: config.data
                }
            },

            scales: scales,

            unit: {
                type: 'COORDS.MAP',

                expression: {operator: 'none', source: '/'},

                code: scalesPool('value', config.code),
                fill: scalesPool('fill', config.fill),

                size: scalesPool('size', config.size, guide.size),
                color: scalesPool('color', config.color, guide.color),
                latitude: scalesPool('linear', config.latitude, {autoScale: false}),
                longitude: scalesPool('linear', config.longitude, {autoScale: false}),

                guide: guide
            }
        };
    }
};

class Chart extends Plot {

    constructor(config) {

        var chartFactory = typesChart[config.type];

        if (!_.isFunction(chartFactory)) {
            throw new Error(`Chart type ${config.type} is not supported. Use one of ${_.keys(typesChart).join(', ')}.`);
        }

        config = _.defaults(config, {autoResize: true});
        config.settings = Plot.setupSettings(config.settings);
        config.dimensions = Plot.setupMetaInfo(config.dimensions, config.data);

        super(chartFactory(config));

        if (config.autoResize) {
            Chart.winAware.push(this);
        }
    }

    destroy() {
        var index = Chart.winAware.indexOf(this);
        if (index !== -1) {
            Chart.winAware.splice(index, 1);
        }
        super.destroy();
    }
}

Chart.resizeOnWindowEvent = (function () {

    var rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (fn) {
            return setTimeout(fn, 17);
        };
    var rIndex;

    function requestReposition() {
        if (rIndex || !Chart.winAware.length) {
            return;
        }
        rIndex = rAF(resize);
    }

    function resize() {
        rIndex = 0;
        var chart;
        for (var i = 0, l = Chart.winAware.length; i < l; i++) {
            chart = Chart.winAware[i];
            chart.resize();
        }
    }

    return requestReposition;
}());
Chart.winAware = [];
window.addEventListener('resize', Chart.resizeOnWindowEvent);
export {Chart};
