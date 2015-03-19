var f = (x) => Math.sqrt(x);

var sizeScale = function (srcValues, minSize, maxSize, normalSize) {

    var values = _.filter(srcValues, _.isFinite);

    if (values.length === 0) {
        return (x) => normalSize;
    }

    var k = 1;
    var xMin = 0;

    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);

    var len = f(Math.max.apply(
        null,
        [
            Math.abs(min),
            Math.abs(max),
            max - min
        ]));

    xMin = (min < 0) ? min : 0;
    k = (len === 0) ? 1 : ((maxSize - minSize) / len);

    return function (x) {
        var numX = (x !== null) ? parseFloat(x) : 0;

        if (!_.isFinite(numX)) {
            return maxSize;
        }

        var posX = (numX - xMin); // translate to positive x domain

        return (minSize + (f(posX) * k));
    };
};
var s = 23;
export {sizeScale};