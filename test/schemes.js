var schemes = {};
(function (schemes) {
    var point = schema({
        color: [null, String],
        size: [null, String],
        type: "ELEMENT.POINT",
        x: [String],
        y: [String]
    });
    var dimension = schema({
        scaleType: String
    });
    var scaleDim = schema({
        scaleDim: String
    });

    var dimensions = {
        '*': [null, dimension]
    };
    var scatterplot = schema({
        dimensions: dimensions,
        unit: schema({
            guide: undefined,
            x: scaleDim,
            y: scaleDim,
            type: "COORDS.RECT",
            unit: Array.of(point)

        })
    });
    schemes.point = point;
    schemes.scatterplot = scatterplot
}(schemes));

