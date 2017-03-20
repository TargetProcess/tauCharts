var sizeScale = function (srcValues, minSize, maxSize, normalSize) {

    var values = srcValues.filter(x => Number.isFinite(Number(x)));

    if (values.length === 0) {
        return () => normalSize;
    }

    var k = 1;
    var xMin = 0;

    var min = Math.min(...values);
    var max = Math.max(...values);

    var len = Math.sqrt(Math.max(Math.abs(min), Math.abs(max), max - min));

    xMin = (min < 0) ? min : 0;
    k = (len === 0) ? 1 : ((maxSize - minSize) / len);

    return function (x) {
        var numX = (x !== null) ? parseFloat(x) : 0;

        if (!Number.isFinite(numX)) {
            return maxSize;
        }

        var posX = (numX - xMin); // translate to positive x domain

        return (minSize + (Math.sqrt(posX) * k));
    };
};

export {sizeScale};