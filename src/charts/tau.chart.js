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
function transformConfig(type, config) {
    var x = normalizeSettings(config.x);
    var y = normalizeSettings(config.y);
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
        var currentGuide = guide.pop();
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
            spec.guide = currentGuide || {
                padding: {l: 45, b: 45, r: 24, t: 24},
                showGridLines: 'xy',
                x: {label: currentX},
                y: {label: currentY}
            };
        } else {
            spec = {
                type: 'COORDS.RECT',
                x:convertAxis(currentX),
                y:convertAxis(currentY),
                unit: [spec],
                guide :currentGuide || {
                    padding: {l: 0, b: 45, r: 0, t: 0},
                    x: {label: currentX},
                    y: {label: currentY}
                }
            };
        }
    }


    config.spec = {
        dimensions: config.dimensions,
        unit: spec
    };
    console.log(config);
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
        var dimensions = this._normalizeDimensions(config.dimensions, config.data);
        config.dimensions = dimensions;
        return typesChart[config.type](config);
    }
}