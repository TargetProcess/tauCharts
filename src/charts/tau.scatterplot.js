import {Chart} from './tau.chart';

function convertAxis(data) {
    if(!data) {
        return null;
    }
    return {scaleDim: data};
}
export class Scatterplot extends Chart {
    convertConfig(config) {
        var chartConfig = _.omit(config, 'spec');
        chartConfig.spec = {
            dimensions: config.dimensions,
            H:config.height,
            W:config.width,
            container:config.container,
            unit:{
                type: 'COORDS.RECT',
                axes: [
                    convertAxis(config.x),
                    convertAxis(config.y)
                ],
                guide: {
                    padding: { L:24, B:24, R:24, T:24 },
                    showGridLines: 'xy'
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