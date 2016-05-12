import {utils} from '../utils/utils';
import {default as _} from 'underscore';
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
        split: config.split,
        guide: {
            color: config.colorGuide,
            size: config.sizeGuide
        },
        flip: config.flip,
        stack: config.stack,
        size: config.size,
        text: config.text
    };
};

const status = {
    SUCCESS: 'SUCCESS',
    WARNING: 'WARNING',
    FAIL: 'FAIL'
};

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

    var guide = normalizeSettings(config.guide || {}, {});

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
                split: config.split,
                color: config.color,
                text: config.text,
                size: config.size,
                flip: config.flip,
                stack: config.stack,
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

export {normalizeConfig, transformConfig};