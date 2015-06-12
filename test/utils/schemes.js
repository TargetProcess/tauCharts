define(['js-schema'], function (schema) {
    var schemes = {};
    (function (schemes) {

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
        schemes.dimensions = dimensions;
        schemes.point = point;
        schemes.interval = interval;
        schemes.bar = bar;
        schemes.barGPL = barGPL;
        schemes.line = lineSpec;
        schemes.scatterplot = scatterplot;
        schemes.config = config;
    }(schemes));

    return schemes;
});