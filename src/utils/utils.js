var traverseJSON = (srcObject, byProperty, fnSelectorPredicates, funcTransformRules) => {

    var rootRef = funcTransformRules(fnSelectorPredicates(srcObject), srcObject);

    (rootRef[byProperty] || []).forEach((unit) => traverseJSON(unit, byProperty, fnSelectorPredicates, funcTransformRules));

    return rootRef;
};

var utils = {
    clone: (obj) => JSON.parse(JSON.stringify(obj)),
    isArray: (obj) => Array.isArray(obj),

    autoScale: (domain) => {

        var m = 10;

        var low = Math.min.apply(null, domain);
        var top = Math.max.apply(null, domain);

        if (low === top) {
            let k = (top >= 0) ? -1 : 1;
            let d = (top || 1);
            top = top - k * d / m;
        }

        var extent = [low, top];
        var span = extent[1] - extent[0];
        var step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10));
        var err = m / span * step;

        var correction = [
            [0.15, 10],
            [0.35, 5],
            [0.75, 2],
            [1.00, 1],
            [2.00, 1]
        ];

        var i = -1;
        while (err > correction[++i][0]) {
        }

        step *= correction[i][1];

        extent[0] = Math.floor(extent[0] / step) * step;
        extent[1] = Math.ceil(extent[1] / step) * step;

        var deltaLow = low - extent[0];
        var deltaTop = extent[1] - top;

        var limit = (step / 2);

        if (low >= 0) {
            // include 0 by default
            extent[0] = 0;
        }
        else {
            var koeffLow = (deltaLow <= limit) ? step : 0;
            extent[0] = (extent[0] - koeffLow);
        }

        if (top <= 0) {
            // include 0 by default
            extent[1] = 0;
        }
        else {
            var koeffTop = (deltaTop <= limit) ? step : 0;
            extent[1] = extent[1] + koeffTop;
        }

        return [
            parseFloat(extent[0].toFixed(15)),
            parseFloat(extent[1].toFixed(15))
        ];
    },

    traverseJSON: traverseJSON
};

export {utils};