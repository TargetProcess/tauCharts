import {Plot} from './tau.plot';

function convertAxis(data) {
    if (!data) {
        return null;
    }

    return data;
}

function generateSimpleConfig(type, config) {
    var chartConfig = _.omit(config, 'spec');
    var colorGuide = config.guide && config.guide.color || {};
    var element = {
        type: type,
        x: config.x,
        y: config.y,
        color: config.color,
        guide: {
            color: colorGuide
        }
    };
    if (config.size) {
        element.size = config.size;
    }
    if (config.flip) {
        element.flip = config.flip;
    }
    chartConfig.spec = {
        dimensions: config.dimensions,
        unit: {
            type: 'COORDS.RECT',
            x: convertAxis(config.x),
            y: convertAxis(config.y),
            guide: config.guide || {
                padding: {l: 54, b: 24, r: 24, t: 24},
                showGridLines: 'xy',
                x: {label: config.x},
                y: {label: config.y}
            },
            unit: [element]
        }

    };
    return chartConfig;
}
var typesChart = {
    'scatterplot': (config)=> {
        return generateSimpleConfig('ELEMENT.POINT', config);
    },
    'line': (config) => {
        return generateSimpleConfig('ELEMENT.LINE', config);
    },
    'bar': (config) => {
        config.flip  = true;
        return generateSimpleConfig('ELEMENT.INTERVAL', config);
    },
    'horizontalBar': (config) => {
        config.flip  = true;
        return generateSimpleConfig('ELEMENT.INTERVAL', config);
    }
};

export class Chart extends Plot {
    convertConfig(config) {
        return typesChart[config.type](config);
    }
}