(function () {
    function loessFn(xval, yval, bandwidth) {
        function tricube(x) {
            var tmp = 1 - x * x * x;
            return tmp * tmp * tmp;
        }

        var res = [];

        var left = 0;
        var right = Math.floor(bandwidth * xval.length) - 1;

        for (var i in xval) {
            var x = xval[i];

            if (i > 0) {
                if (right < xval.length - 1 &&
                    xval[right + 1] - xval[i] < xval[i] - xval[left]) {
                    left++;
                    right++;
                }
            }

            var edge;
            if (xval[i] - xval[left] > xval[right] - xval[i])
                edge = left;
            else
                edge = right;

            var denom = Math.abs(1.0 / (xval[edge] - x));

            var sumWeights = 0;
            var sumX = 0, sumXSquared = 0, sumY = 0, sumXY = 0;

            var k = left;
            while (k <= right) {
                var xk = xval[k];
                var yk = yval[k];
                var dist;
                if (k < i) {
                    dist = (x - xk);
                } else {
                    dist = (xk - x);
                }
                var w = tricube(dist * denom);
                var xkw = xk * w;
                sumWeights += w;
                sumX += xkw;
                sumXSquared += xk * xkw;
                sumY += yk * w;
                sumXY += yk * xkw;
                k++;
            }

            var meanX = sumX / sumWeights;
            var meanY = sumY / sumWeights;
            var meanXY = sumXY / sumWeights;
            var meanXSquared = sumXSquared / sumWeights;

            var beta;
            if (meanXSquared == meanX * meanX)
                beta = 0;
            else
                beta = (meanXY - meanX * meanY) / (meanXSquared - meanX * meanX);

            var alpha = meanY - beta * meanX;

            res[i] = beta * x + alpha;
        }

        return res;
    }

    /** @class Trend
     * @extends Plugin */
    /* Usage
     .plugins(tau.plugins.trend())
     */
    var Trend = {

        init: function () {
        },

        render: function (context, tools) {

            var mapper = tools.mapper;

            mapper.alias('color', 'key');

            var categories = d3.nest()
                .key(mapper.raw('color'))
                .entries(context.data._data);

            var line = d3.svg.line()
                .interpolate('basis')
                .y(function (d) {
                    return d[1];
                })
                .x(function (d) {
                    return d[0];
                });

            var category = tools.svg.selectAll(".category")
                .data(categories)
                .enter().append("g")
                .attr("transform", "translate(20, 0)")
                .attr("class", 'trend-category');


            category.append("path")
                .attr("class", function(d) {
                    return "line trend-line " + mapper.map("color")(d);
                })
                .attr("d", function (d) {
                    var points = { x: [], y: [] };

                    var pushValue = function(axis, value) {
                        var pointValue = mapper.map(axis)(value);
                        points[axis].push(Math.round(pointValue));
                    };

                    for (var i = 0; i < d.values.length; i++) {
                       pushValue("x", d.values[i]);
                       pushValue("y", d.values[i]);
                    }

                    if (points.x.length < 4) {
                        return;
                    }

                    return line(d3.zip(points.x, loessFn(points.x, points.y, 0.5)));
                });
        }
    };


    tau.plugins.add('trend', Trend);
})();
