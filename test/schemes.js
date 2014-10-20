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

    var dimension = schema({
        type: String,
        scaleType: String
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

    var line = schema({
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
    schemes.line = line;
    schemes.scatterplot = scatterplot
}(schemes));

