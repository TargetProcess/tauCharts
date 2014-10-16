import {Plot} from './tau.plot';

function convertAxis(data) {
    if (!data) {
        return null;
    }
    return {scaleDim: data};
}
function generateSimpleConfig(type, config) {
    var chartConfig = _.omit(config, 'spec');
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
            unit: [
                {
                    type: type,
                    x: config.x,
                    y: config.y,
                    color: config.color,
                    size: config.size
                }
            ]
        }

    };
    return chartConfig;
}
var typesChart = {
    'scatterplot': (config)=> {
        return generateSimpleConfig('ELEMENT.POINT',config);
    },
    'line':(config) => {
        return generateSimpleConfig('ELEMENT.LINE',config);
    }
};

export class Chart extends Plot {
    convertConfig(config) {
        return typesChart[config.type](config);
    }
}