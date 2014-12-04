var sizeScale = function (values, minSize, maxSize) {

    values = _.filter(values, _.isFinite);

    var k = 1;
    var xMin = 0;
    if (values.length > 0) {
        var min = Math.min.apply(null, values);
        var max = Math.max.apply(null, values);

        var len = Math.max.apply(
            null,
            [
                Math.abs(min),
                Math.abs(max),
                max - min
            ]);

        xMin = (min < 0) ? min : 0;
        k = (len === 0) ? 1 : ((maxSize - minSize) / len);
    }

    return function(x) {
        var nx = (x !== null) ? parseFloat(x) : 0;
        return (_.isFinite(nx)) ? (minSize + ((nx - xMin) * k)) : maxSize;
    };
};

export {sizeScale};