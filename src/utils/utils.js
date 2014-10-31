var utils = {
    clone: (obj) => JSON.parse(JSON.stringify(obj)),
    isArray: (obj)=>Array.isArray(obj),

    autoScale: (domain) => {

        var m = 10;

        var extent = [Math.min.apply(null, domain), Math.max.apply(null, domain)];
        var span = extent[1] - extent[0];
        var step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10));
        var err = m / span * step;

        var correction = [
            [0.15, 10],
            [0.35, 5],
            [0.75, 2],
            [1.00, 1]
        ];

        var i = -1;
        while (err > correction[++i][0]) {}

        step *= correction[i][1];

        extent[0] = Math.floor(extent[0] / step) * step;
        extent[1] = Math.ceil(extent[1] / step) * step;

        var deltaLow = domain[0] - extent[0];
        var deltaTop = extent[1] - domain[1];

        var limit = (step / 10);

        extent[0] = (deltaLow <= limit) ? (extent[0] - step) : extent[0];
        extent[1] = (deltaTop <= limit) ? (extent[1] + step) : extent[1];

        // include 0 by default
        extent[0] = Math.min(0, extent[0]);

        return extent;
    }
};

export {utils};