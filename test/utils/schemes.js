define(['js-schema'],function(schema){
    var schemes = {};
    (function (schemes) {

        var point = schema({
            color: [null, String],
            size: [null, String],
            type: "ELEMENT.POINT",
            x: [String],
            y: [String]
        });

        var line = schema({
            color: [null, String],
            type: "ELEMENT.LINE",
            x: [String],
            y: [String]
        });

        var interval = schema({
            color: [null, String],
            flip: [Boolean],
            type: "ELEMENT.INTERVAL",
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
                type: "COORDS.RECT",
                unit: Array.of(point)

            })
        });

        var bar = schema({
            dimensions: dimensions,
            unit: schema({
                guide: undefined,
                x: [null, String],
                y: [null, String],
                type: "COORDS.RECT",
                unit: Array.of(interval)

            })
        });

        var lineSpec = schema({
            dimensions: dimensions,
            unit: schema({
                guide: undefined,
                x: [null, String],
                y: [null, String],
                type: "COORDS.RECT",
                unit: Array.of(line)

            })
        });
        schemes.point = point;
        schemes.bar = bar;
        schemes.line = lineSpec;
        schemes.scatterplot = scatterplot
    }(schemes));

    return  schemes;
});

