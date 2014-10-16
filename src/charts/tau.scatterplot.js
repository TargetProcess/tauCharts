import {Chartillo} from './tau.chartillo';

function convertAxis(data) {
    if (!data) {
        return null;
    }
    return {scaleDim: data};
}
export class Scatterplot extends Chartillo {
    convertConfig(config) {
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
                        type: 'ELEMENT.POINT',
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
}