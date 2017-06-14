// BUG: Webpack fails to import a function,
// points to `default` property.
// import schema from 'js-schema';
var schema = require('js-schema');

        var point = schema({
            color: [null, String],
            size: [null, String],
            type: 'ELEMENT.POINT',
            x: [String],
            y: [String]
        });

        var line = schema({
            color: [null, String],
            type: 'ELEMENT.LINE',
            x: [String],
            y: [String]
        });

        var interval = schema({
            color: [null, String],
            flip: [null, Boolean],
            type: 'ELEMENT.INTERVAL',
            x: [String],
            y: [String]
        });

        var intervalGPL = schema({
            color: [null, String],
            flip: [null, Boolean],
            type: 'ELEMENT.INTERVAL',
            x: [String],
            y: [String]
        });

        var dimension = schema({
            type: String,
            scale: String
        });

        var dimensions = {
            '*': [null, dimension]
        };

        var scatterplot = schema({
            dimensions: dimensions,
            unit: schema({
                guide: undefined,
                x: [null, String],
                y: [null, String],
                type: 'COORDS.RECT',
                unit: Array.of(point)

            })
        });

        var bar = schema({
            dimensions: dimensions,
            unit: schema({
                guide: undefined,
                x: [null, String],
                y: [null, String],
                type: 'COORDS.RECT',
                unit: Array.of(interval)

            })
        });

        var scale = schema({type: String, source:String});
        var scales = {
            '*': [null, scale]
        };
        var barGPL = schema({
            scales: scales,
            unit: schema({
                guide: undefined,
                x: [null, String],
                y: [null, String],
                type: 'COORDS.RECT',
                units: Array.of(intervalGPL)

            })
        });

        var scatterplotGPL = schema({
            scales: scales,
            unit: schema({
                guide: undefined,
                x: [null, String],
                y: [null, String],
                type: 'COORDS.RECT',
                units: Array.of(point)
            })
        });

        var lineGPL = schema({
            scales: scales,
            unit: schema({
                guide: undefined,
                x: [null, String],
                y: [null, String],
                type: 'COORDS.RECT',
                units: Array.of(line)
            })
        });

        var lineSpec = schema({
            dimensions: dimensions,
            unit: schema({
                guide: undefined,
                x: [null, String],
                y: [null, String],
                type: 'COORDS.RECT',
                unit: Array.of(line)
            })
        });

        var config = schema({
            data: Array,
            spec: Object
        });

export default {
    scales,
    dimensions,
    point,
    interval,
    bar,
    barGPL,
    lineSpec,
    lineGPL,
    scatterplot,
    scatterplotGPL,
    config,
};