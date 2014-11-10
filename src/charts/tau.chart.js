import {Plot} from './tau.plot';
import {utils} from '../utils/utils';

function convertAxis(data) {
    return (!data) ? null : data;
}
function normalizeSettings(axis) {
    if (!utils.isArray(axis)) {
        return [axis];
    }
    return axis;
}
function createElement(type, config) {
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
}
const status = {
    SUCCESS: "SUCCESS",
    WARNING: "WARNING",
    FAIL: "FAIL"
};
/* jshint ignore:start */
var strategyNormalizeAxis = {
    [status.SUCCESS]: (axis)=> axis,
    [status.FAIL]: ()=> {
        throw new Error('This configuration not supported, See http://api.taucharts.com/basic/facet.html#easy-approach-for-creating-facet-chart');
    },
    [status.WARNING]: (axis, config)=> {
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
    var spec = {
        type: 'COORDS.RECT',
        unit: []
    };
    var colorGuide = config.guide && config.guide.color || {};
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
                colorGuide: colorGuide
            }));
            spec.guide = _.defaults(currentGuide, {
                padding: {l: 45, b: 45, r: 24, t: 24},
                showGridLines: 'xy',
                x: {label: currentX},
                y: {label: currentY}
            });
        } else {
            spec = {
                type: 'COORDS.RECT',
                x: convertAxis(currentX),
                y: convertAxis(currentY),
                unit: [spec],
                guide: _.defaults(currentGuide, {
                    padding: {l: 45, b: 45, r: 0, t: 0},
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
    convertConfig(config) {
        config.dimensions = this._normalizeDimensions(config.dimensions, config.data);
        return typesChart[config.type](config);
    }
}