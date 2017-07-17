import * as utils from '../utils/utils';
import {
    ChartConfig,
    ChartDimensionsMap,
    UnitGuide,
    Unit
} from '../definitions';

interface XChartConfig extends ChartConfig {
    colorGuide?: Object;
    sizeGuide?: Object;
}

interface ValidatedConfig {
    status: string;
    countMeasureAxis: number;
    indexMeasureAxis: number[];
    messages: string[];
    axis: string;
}

var convertAxis = <T>(data: T) => (!data) ? null : data;

var normalizeSettings = <T>(axis: T | T[], defaultValue: T = null): T[] => {
    return (!Array.isArray(axis)) ?
        [axis] :
        (axis.length === 0) ? [defaultValue] : axis;
};

var createElement = (type: string, config: XChartConfig) => {
    return {
        type: type,
        x: config.x as string,
        y: config.y as string,
        identity: config.identity,
        size: config.size,
        color: config.color,
        split: config.split,
        label: config.label,
        guide: {
            color: config.colorGuide,
            size: config.sizeGuide
        },
        flip: config.flip,
        stack: config.stack
    };
};

const status = {
    SUCCESS: 'SUCCESS',
    WARNING: 'WARNING',
    FAIL: 'FAIL'
};

interface NormalizeAxisStrategies {
    [status: string]: (
        axis: string[],
        config: ValidatedConfig,
        guide: UnitGuide[]
    ) => string[];
}

var strategyNormalizeAxis: NormalizeAxisStrategies = {
    [status.SUCCESS]: (axis) => axis,
    [status.FAIL]: (axis, data) => {
        throw new Error((data.messages || []).join('\n') ||
            [
                'This configuration is not supported,',
                'See http://api.taucharts.com/basic/facet.html#easy-approach-for-creating-facet-chart'
    ].join(' '));
    },
    [status.WARNING]: (axis, config, guide) => {
        var axisName = config.axis;
        var index = config.indexMeasureAxis[0];
        var measure = axis[index];
        var newAxis = axis.filter(x => x !== measure);
        newAxis.push(measure);

        var measureGuide = guide[index][axisName] || {};
        var categoryGuide = guide[guide.length - 1][axisName] || {};

        guide[guide.length - 1][axisName] = measureGuide;
        guide[index][axisName] = categoryGuide;

        return newAxis;
    }
};

function validateAxis(dimensions: ChartDimensionsMap, axis: string[], axisName: string) {
    return axis.reduce(function (result, item, index) {
        var dimension = dimensions[item];
        if (!dimension) {
            result.status = status.FAIL;
            if (item) {
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
    }, <ValidatedConfig>{
        status: status.SUCCESS,
        countMeasureAxis: 0,
        indexMeasureAxis: [],
        messages: [],
        axis: axisName
    });
}

function normalizeConfig(config: ChartConfig) {

    var x = normalizeSettings(config.x);
    var y = normalizeSettings(config.y);

    var maxDeep = Math.max(x.length, y.length);

    var guide = normalizeSettings(config.guide || {}, {});
    let gapsSize = maxDeep - guide.length;

    // feel the gaps if needed
    for (let i = 0; i < gapsSize; i++) {
        guide.push({});
    }

    // cut items
    guide = guide.slice(0, maxDeep);

    var validatedX = validateAxis(config.dimensions, x, 'x');
    var validatedY = validateAxis(config.dimensions, y, 'y');
    x = strategyNormalizeAxis[validatedX.status](x, validatedX, guide);
    y = strategyNormalizeAxis[validatedY.status](y, validatedY, guide);

    return Object.assign(
        {},
        config,
        {
            x: x,
            y: y,
            guide: guide
        });
}

function transformConfig(type: string, config: ChartConfig) {

    var x = config.x;
    var y = config.y;
    var guide = config.guide;
    var maxDepth = Math.max(x.length, y.length);

    var spec = {
        type: 'COORDS.RECT',
        unit: []
    } as Unit;

    var xs: string[] = [].concat(x);
    var ys: string[] = [].concat(y);
    var gs: UnitGuide[] = [].concat(guide);

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
                identity: config.identity,
                split: config.split,
                color: config.color,
                label: config.label,
                size: config.size,
                flip: config.flip,
                stack: config.stack,
                colorGuide: currentGuide.color,
                sizeGuide: currentGuide.size
            }));
            spec.guide = utils.defaults(
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
                guide: utils.defaults(
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
